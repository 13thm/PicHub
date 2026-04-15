import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  deletePictureUsingPost,
  updatePictureUsingPost,
  uploadPictureUsingPost,
  batchExtractPictureUrlUsingGet,
  uploadPictureByBatchUsingPost, listAdminPictureVoByPageUsingPost
} from "@/api/pictureController";
import { userLogoutUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./PictureManagePage.css";

interface PictureVO {
  id?: number;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string;
  introduction?: string;
  picFormat?: string;
  reviewStatus?: number;
  userId?: number;
  createTime?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function PictureManagePage() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
  const [pictures, setPictures] = useState<PictureVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("pictureManage");
  const [editingPicture, setEditingPicture] = useState<PictureVO | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [uploadData, setUploadData] = useState({ name: "", category: "", tags: "", introduction: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewPicture, setPreviewPicture] = useState<PictureVO | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchKeyword, setBatchKeyword] = useState("");
  const [batchCount, setBatchCount] = useState(10);
  const [batchUrls, setBatchUrls] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchUploadLoading, setBatchUploadLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const menuItems: MenuItem[] = [
    {
      key: "dashboard",
      label: "首页",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key: "userManage",
      label: "用户管理",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      key: "pictureManage",
      label: "图片管理",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      key: "pictureReview",
      label: "图片审核",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      key: "spaceManage",
      label: "空间管理",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  const handleMenuClick = (key: string) => {
    setActiveMenu(key);
    if (key === "dashboard") {
      navigate("/admin");
    } else if (key === "userManage") {
      navigate("/user-manage");
    } else if (key === "pictureReview") {
      navigate("/manage/picture-review");
    } else if (key === "spaceManage") {
      navigate("/manage/space");
    }
  };

  const fetchPictures = async () => {
    setLoading(true);
    try {
      const res = await listAdminPictureVoByPageUsingPost({
        current,
        pageSize,
        searchField: searchText || undefined,
        category: category || undefined,
      });
      // @ts-ignore
      if (res.code === 0 && res.data?.records) {
        // @ts-ignore
        setPictures(res.data.records);
        // @ts-ignore
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error("获取图片列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, [current, pageSize, searchText, category]);

  const handleSearch = () => {
    setCurrent(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrent(1);
  };

  const handleEdit = (picture: PictureVO) => {
    setEditingPicture({ ...picture });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editingPicture || !editingPicture.id) return;
    try {
      const res = await updatePictureUsingPost({
        id: editingPicture.id,
        name: editingPicture.name,
        category: editingPicture.category,
        tags: editingPicture.tags,
        introduction: editingPicture.introduction,
      });
      // @ts-ignore
      if (res.code === 0) {
        showMessage("修改成功");
        setEditModalVisible(false);
        fetchPictures();
      } else {
        // @ts-ignore
        showMessage(res.message || "修改失败", "error");
      }
    } catch (error) {
      console.error("修改图片失败", error);
      showMessage("修改失败", "error");
    }
  };

  const handleBatchFetch = async () => {
    if (!batchKeyword.trim()) {
      showMessage("请输入关键词", "error");
      return;
    }
    setBatchLoading(true);
    setBatchUrls([]);
    setSelectedUrls(new Set());
    setImageErrors(new Set());
    try {
      const res = await batchExtractPictureUrlUsingGet({
        searchText: batchKeyword,
        count: batchCount,
      });
      console.log("获取到的URL:", res);
      console.log("获取到的URL:", res);
      // @ts-ignore
      if (res.code === 0 && res.data) {
        setBatchUrls(res.data);
        showMessage(`成功获取 ${res.data.length} 个URL`);
      } else {
        // @ts-ignore
        showMessage(res.message || "获取URL失败", "error");
      }
    } catch (error) {
      console.error("获取URL失败", error);
      showMessage("获取URL失败", "error");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleToggleUrl = (index: number) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedUrls(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUrls.size === batchUrls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(batchUrls.map((_, i) => i)));
    }
  };

  const handleBatchUpload = async () => {
    if (selectedUrls.size === 0) {
      showMessage("请选择要上传的图片", "error");
      return;
    }
    setBatchUploadLoading(true);
    try {
      const selectedUrlsArray = Array.from(selectedUrls).map(index => batchUrls[index]);
      const res = await uploadPictureByBatchUsingPost({
        search: batchKeyword,
        urls: selectedUrlsArray,
      });
      // @ts-ignore
      if (res.code === 0) {
        showMessage(`成功上传 ${res.data || selectedUrls.size} 张图片`);
        setBatchModalVisible(false);
        setBatchUrls([]);
        setSelectedUrls(new Set());
        setBatchKeyword("");
        fetchPictures();
      } else {
        // @ts-ignore
        showMessage(res.message || "上传失败", "error");
      }
    } catch (error) {
      console.error("批量上传失败", error);
      showMessage("批量上传失败", "error");
    } finally {
      setBatchUploadLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该图片吗？")) return;
    try {
      const res = await deletePictureUsingPost({ id });
      // @ts-ignore
      if (res.code === 0) {
        showMessage("删除成功");
        fetchPictures();
      } else {
        // @ts-ignore
        showMessage(res.message || "删除失败", "error");
      }
    } catch (error) {
      console.error("删除图片失败", error);
      showMessage("删除失败", "error");
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.name) {
      showMessage("请选择图片并填写名称", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await uploadPictureUsingPost(
        { name: uploadData.name, category: uploadData.category || undefined, tags: uploadData.tags || undefined, introduction: uploadData.introduction || undefined },
        {},
        uploadFile
      );
      // @ts-ignore
      if (res.code === 0) {
        showMessage("上传成功");
        setUploadModalVisible(false);
        setUploadData({ name: "", category: "", tags: "", introduction: "" });
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPictures();
      } else {
        // @ts-ignore
        showMessage(res.message || "上传失败", "error");
      }
    } catch (error) {
      console.error("上传图片失败", error);
      showMessage("上传失败", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showMessage("请选择图片文件", "error");
        return;
      }
      setUploadFile(file);
      if (!uploadData.name) {
        setUploadData({ ...uploadData, name: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await userLogoutUsingPost();
      setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const handleBackToUser = () => {
    navigate("/home");
  };

  const handleDownload = async (picture: PictureVO) => {
    if (!picture.id || !picture.url) return;
    // 直接打开图片 URL 进行下载
    const link = document.createElement('a');
    link.href = picture.url;
    link.target = '_blank';
    link.download = `${picture.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage("下载成功");
  };

  const handlePreview = (picture: PictureVO) => {
    setPreviewPicture(picture);
  };

  const getReviewStatusText = (status: number) => {
    switch (status) {
      case 0: return "待审核";
      case 1: return "已通过";
      case 2: return "已拒绝";
      default: return "未知";
    }
  };

  const getReviewStatusClass = (status: number) => {
    switch (status) {
      case 0: return "pending";
      case 1: return "approved";
      case 2: return "rejected";
      default: return "";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="manage-container">
      <aside className={`sidebar ${sidebarExpanded ? "expanded" : "collapsed"}`}>
        <div className="sidebar-toggle" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${activeMenu === item.key ? "active" : ""}`}
              onClick={() => handleMenuClick(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className={`manage-main ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
        {message && (
          <div className={`toast-message ${message.type}`}>
            {message.text}
          </div>
        )}
        <header className="manage-header">
          <div className="header-left">
            <h1>图片管理</h1>
          </div>
          <div className="header-right">
            <button className="upload-btn" onClick={() => setUploadModalVisible(true)}>
              上传图片
            </button>
            <button className="batch-upload-btn" onClick={() => setBatchModalVisible(true)}>
              采集图片
            </button>
            <button onClick={handleBackToUser} className="back-btn">
              返回用户端
            </button>
            <button onClick={handleLogout} className="logout-btn">
              退出登录
            </button>
          </div>
        </header>

        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索图片名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">全部分类</option>
            <option value="wallpaper">壁纸</option>
            <option value="avatar">头像</option>
            <option value="photo">照片</option>
            <option value="other">其他</option>
          </select>
          <button onClick={handleSearch} className="search-btn">
            搜索
          </button>
        </div>

        <div className="table-container">
          <table className="picture-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>缩略图</th>
                <th>图片名称</th>
                <th>分类</th>
                <th>标签</th>
                <th>审核状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loading-cell">加载中...</td>
                </tr>
              ) : pictures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">暂无图片</td>
                </tr>
              ) : (
                pictures.map((picture) => (
                  <tr key={picture.id}>
                    <td>{picture.id}</td>
                    <td>
                      <img
                        src={picture.thumbnailUrl || picture.url}
                        alt={picture.name}
                        className="table-thumbnail"
                        onClick={() => handlePreview(picture)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>{picture.name}</td>
                    <td>
                      <span className="category-badge">{picture.category || "未分类"}</span>
                    </td>
                    <td>
                      <div className="tags-cell">
                        {picture.tags?.split(",").slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag-badge">{tag.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`review-badge ${getReviewStatusClass(picture.reviewStatus || 0)}`}>
                        {getReviewStatusText(picture.reviewStatus || 0)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" onClick={() => handlePreview(picture)}>查看</button>
                        <button className="download-btn" onClick={() => handleDownload(picture)}>下载</button>
                        <button className="edit-btn" onClick={() => handleEdit(picture)}>修改</button>
                        <button className="delete-btn" onClick={() => picture.id && handleDelete(picture.id)}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="total-text">
            共 {total} 条记录，第 {current}/{totalPages || 1} 页
          </span>
          <div className="pagination-buttons">
            <button disabled={current === 1} onClick={() => setCurrent(1)}>首页</button>
            <button disabled={current === 1} onClick={() => setCurrent(current - 1)}>上一页</button>
            <button disabled={current >= totalPages} onClick={() => setCurrent(current + 1)}>下一页</button>
            <button disabled={current >= totalPages} onClick={() => setCurrent(totalPages)}>末页</button>
          </div>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={12}>12条/页</option>
            <option value={24}>24条/页</option>
            <option value={48}>48条/页</option>
          </select>
        </div>

        {editModalVisible && editingPicture && (
          <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>修改图片信息</h2>
              <div className="form-group">
                <label>图片名称</label>
                <input
                  type="text"
                  value={editingPicture.name || ""}
                  onChange={(e) => setEditingPicture({ ...editingPicture, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>分类</label>
                <select
                  value={editingPicture.category || ""}
                  onChange={(e) => setEditingPicture({ ...editingPicture, category: e.target.value })}
                >
                  <option value="">请选择分类</option>
                  <option value="wallpaper">壁纸</option>
                  <option value="avatar">头像</option>
                  <option value="photo">照片</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label>标签</label>
                <input
                  type="text"
                  value={editingPicture.tags || ""}
                  onChange={(e) => setEditingPicture({ ...editingPicture, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔"
                />
              </div>
              <div className="form-group">
                <label>简介</label>
                <textarea
                  value={editingPicture.introduction || ""}
                  onChange={(e) => setEditingPicture({ ...editingPicture, introduction: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setEditModalVisible(false)}>取消</button>
                <button className="submit-btn" onClick={handleEditSubmit}>提交</button>
              </div>
            </div>
          </div>
        )}

        {uploadModalVisible && (
          <div className="modal-overlay" onClick={() => setUploadModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>上传图片</h2>
              <div className="form-group">
                <label>选择图片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                {uploadFile && <div className="file-preview">{uploadFile.name}</div>}
              </div>
              <div className="form-group">
                <label>图片名称 *</label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  placeholder="请输入图片名称"
                />
              </div>
              <div className="form-group">
                <label>分类</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                >
                  <option value="">请选择分类</option>
                  <option value="wallpaper">壁纸</option>
                  <option value="avatar">头像</option>
                  <option value="photo">照片</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label>标签</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  placeholder="多个标签用逗号分隔"
                />
              </div>
              <div className="form-group">
                <label>简介</label>
                <textarea
                  value={uploadData.introduction}
                  onChange={(e) => setUploadData({ ...uploadData, introduction: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setUploadModalVisible(false)}>取消</button>
                <button className="submit-btn" onClick={handleUpload} disabled={loading}>上传</button>
              </div>
            </div>
          </div>
        )}

        {batchModalVisible && (
          <div className="modal-overlay" onClick={() => setBatchModalVisible(false)}>
            <div className="modal-content batch-modal" onClick={(e) => e.stopPropagation()}>
              <h2>批量采集图片</h2>
              <div className="form-group">
                <label>搜索关键词</label>
                <input
                  type="text"
                  value={batchKeyword}
                  onChange={(e) => setBatchKeyword(e.target.value)}
                  placeholder="请输入搜索关键词（如：风景、宠物等）"
                />
              </div>
              <div className="form-group">
                <label>获取数量</label>
                <select value={batchCount} onChange={(e) => setBatchCount(Number(e.target.value))}>
                  <option value={5}>5张</option>
                  <option value={10}>10张</option>
                  <option value={20}>20张</option>
                  <option value={30}>30张</option>
                  <option value={50}>50张</option>
                </select>
              </div>
              <button 
                className="fetch-btn" 
                onClick={handleBatchFetch} 
                disabled={batchLoading || !batchKeyword.trim()}
              >
                {batchLoading ? "获取中..." : "获取网络图片"}
              </button>
              
              {batchUrls.length > 0 && (
                <div className="batch-url-list">
                  <div className="batch-url-header">
                    <span>共获取 {batchUrls.length} 个URL，已选择 {selectedUrls.size} 个</span>
                    <button className="select-all-btn" onClick={handleSelectAll}>
                      {selectedUrls.size === batchUrls.length ? "取消全选" : "全选"}
                    </button>
                  </div>
                  <div className="batch-url-grid">
                    {batchUrls.map((url, index) => (
                      <div 
                        key={index} 
                        className={`batch-url-item ${selectedUrls.has(index) ? "selected" : ""} ${imageErrors.has(index) ? "error" : ""}`}
                        onClick={() => handleToggleUrl(index)}
                      >
                        {imageErrors.has(index) ? (
                          <div className="image-error">无法加载</div>
                        ) : (
                          <img 
                            src={url} 
                            alt={`${batchKeyword}_${index + 1}`} 
                            onError={() => handleImageError(index)}
                          />
                        )}
                        <div className="batch-url-check">
                          {selectedUrls.has(index) ? "✓" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setBatchModalVisible(false)}>取消</button>
                    <button 
                      className="submit-btn" 
                      onClick={handleBatchUpload}
                      disabled={batchUploadLoading || selectedUrls.size === 0}
                    >
                      {batchUploadLoading ? "上传中..." : `上传到图库 (${selectedUrls.size})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {previewPicture && (
          <div className="preview-overlay" onClick={() => setPreviewPicture(null)}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
              <img src={previewPicture.url || previewPicture.thumbnailUrl} alt={previewPicture.name} />
              <div className="preview-info">
                <h3>{previewPicture.name}</h3>
                <p>{previewPicture.introduction || "暂无简介"}</p>
                <button className="download-btn" onClick={() => handleDownload(previewPicture)}>下载</button>
              </div>
              <button className="preview-close" onClick={() => setPreviewPicture(null)}>×</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
