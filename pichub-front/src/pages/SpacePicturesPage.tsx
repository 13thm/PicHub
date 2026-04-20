import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listAdminPictureVoByPageUsingPost, deletePictureUsingPost } from "@/api/pictureController";
import { isSpacePermissionUsingGet } from "@/api/spaceUserController";
import { useUser } from "@/contexts/UserContext";
import "./HomePage.css";

interface PictureVO {
  id?: number;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string;
  introduction?: string;
  createTime?: string;
}

type PermissionType = "viewer" | "editor" | "admin" | "none";

export default function SpacePicturesPage() {
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();
  const { setLoginUser, loginUser } = useUser();
  const [pictures, setPictures] = useState<PictureVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchTags, setSearchTags] = useState("");

  const [selectedPicture, setSelectedPicture] = useState<PictureVO | null>(null);
  const [permission, setPermission] = useState<PermissionType>("none");
  const [permissionLoading, setPermissionLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("风景");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadIntroduction, setUploadIntroduction] = useState("");

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const checkPermission = async () => {
    if (!spaceId || !loginUser?.id) {
      setPermission("none");
      setPermissionLoading(false);
      return;
    }
    setPermissionLoading(true);
    try {
      const res = await isSpacePermissionUsingGet({
        spaceId: Number(spaceId),
        userId: loginUser.id,
      });
      if (res.code === 0 && res.data) {
        const role = res.data as string;
        if (role === "viewer" || role === "editor" || role === "admin") {
          setPermission(role as PermissionType);
        } else {
          setPermission("none");
        }
      } else {
        setPermission("none");
      }
    } catch (error) {
      console.error("获取权限失败", error);
      setPermission("none");
    } finally {
      setPermissionLoading(false);
    }
  };

  const fetchPictures = async () => {
    if (!spaceId) return;
    setLoading(true);
    try {
      const res = await listAdminPictureVoByPageUsingPost({
        current,
        pageSize,
        spaceId: Number(spaceId),
        name: searchName || undefined,
        category: searchCategory || undefined,
        tags: searchTags || undefined,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        const responseData = res.data as any;
        if (responseData?.records) {
          setPictures(responseData.records);
          setTotal(responseData.total || 0);
        }
      }
    } catch (error) {
      console.error("获取图片列表失败", error);
      showMessage("获取图片列表失败", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, [spaceId, loginUser]);

  useEffect(() => {
    if (!permissionLoading) {
      fetchPictures();
    }
  }, [current, pageSize, spaceId, permissionLoading]);

  const handleSearch = () => {
    setCurrent(1);
    fetchPictures();
  };

  const handleResetSearch = () => {
    setSearchName("");
    setSearchCategory("");
    setSearchTags("");
    setCurrent(1);
    setTimeout(fetchPictures, 0);
  };

  const handleViewPicture = (picture: PictureVO) => {
    setSelectedPicture(picture);
  };

  const handleDownload = async (pictureId: number, pictureName: string) => {
    try {
      const { downloadPictureUsingGet } = await import("@/api/pictureController");
      const blob = await downloadPictureUsingGet({ pictureId });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pictureName || `picture_${pictureId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showMessage("下载成功");
    } catch (error) {
      console.error("下载失败", error);
      showMessage("下载失败", "error");
    }
  };

  const handleLogout = async () => {
    try {
      const { userLogoutUsingPost } = await import("@/api/userController");
      await userLogoutUsingPost();
      setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const handleBackToMySpace = () => {
    navigate("/my-space");
  };

  const handleDelete = async (picture: PictureVO) => {
    if (!picture.id) return;
    if (!window.confirm(`确定要删除图片 "${picture.name}" 吗？`)) {
      return;
    }
    try {
      const res = await deletePictureUsingPost({ id: picture.id ,spaceId: Number(spaceId)});
      if (res.code === 0) {
        showMessage("删除成功");
        fetchPictures();
      } else {
        showMessage("删除失败", "error");
      }
    } catch (error) {
      console.error("删除失败", error);
      showMessage("删除失败", "error");
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      showMessage("请选择文件", "error");
      return;
    }
    if (!uploadName) {
      showMessage("请输入图片名称", "error");
      return;
    }

    try {
      const { uploadPictureUsingPost } = await import("@/api/pictureController");
      const res = await uploadPictureUsingPost(
        {
          name: uploadName,
          category: uploadCategory,
          tags: uploadTags,
          introduction: uploadIntroduction,
          spaceId: Number(spaceId),
        },
        {},
        uploadFile
      );

      if (res.code === 0 && res.data) {
        showMessage("上传成功");
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadName("");
        setUploadTags("");
        setUploadIntroduction("");
        fetchPictures();
      } else {
        showMessage("上传失败", "error");
      }
    } catch (error) {
      console.error("上传失败", error);
      showMessage("上传失败", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadName) {
        setUploadName(file.name.split('.')[0]);
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>空间照片 (ID: {spaceId})</h1>
        </div>
        <div className="header-right">
          <button onClick={handleBackToMySpace} className="back-btn">
            返回我的空间
          </button>
          <button onClick={handleLogout} className="logout-btn">
            退出登录
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="搜索图片名称..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
              <option value="">所有分类</option>
              <option value="风景">风景</option>
              <option value="人物">人物</option>
              <option value="动物">动物</option>
              <option value="建筑">建筑</option>
              <option value="科技">科技</option>
              <option value="其他">其他</option>
            </select>
            <input
              type="text"
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              placeholder="搜索标签..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>搜索</button>
            <button className="search-btn" onClick={handleResetSearch}>重置</button>
            {(permission === "editor" || permission === "admin") && (
              <button className="search-btn upload-btn" onClick={() => setShowUploadModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 4 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                上传
              </button>
            )}
          </div>
        </div>

        <div className="picture-gallery">
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : pictures.length === 0 ? (
            <div className="empty-state">暂无图片</div>
          ) : (
            <div className="picture-grid">
              {pictures.map((picture) => (
                <div key={picture.id} className="picture-card" onClick={() => handleViewPicture(picture)}>
                  <div className="picture-image">
                    <img
                      src={picture.thumbnailUrl || picture.url}
                      alt={picture.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e0e0e0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999">加载失败</text></svg>';
                      }}
                    />
                    <div className="picture-overlay" onClick={(e) => e.stopPropagation()}>
                      <button className="view-btn" onClick={() => handleViewPicture(picture)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        查看
                      </button>
                      <button className="download-btn" onClick={() => picture.id && handleDownload(picture.id, picture.name)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载
                      </button>
                      {(permission === "editor" || permission === "admin") && (
                        <button className="delete-btn" onClick={() => handleDelete(picture)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="picture-info">
                    <h3 className="picture-name">{picture.name}</h3>
                    <p className="picture-category">{picture.category || '未分类'}</p>
                    <div className="picture-tags">
                      {picture.tags && picture.tags.split(',').map((tag, index) => (
                        <span key={index} className="tag">{tag.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrent(1); }}>
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        </div>
      </main>

      {selectedPicture && (
        <div className="detail-modal" onClick={() => setSelectedPicture(null)}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <img
              className="detail-image"
              src={selectedPicture.url || selectedPicture.thumbnailUrl}
              alt={selectedPicture.name}
            />
            <div className="detail-info">
              <h2>{selectedPicture.name}</h2>
              <div className="detail-meta">
                <div className="meta-item">
                  <strong>分类：</strong>
                  {selectedPicture.category || '未分类'}
                </div>
                <div className="meta-item">
                  <strong>创建时间：</strong>
                  {selectedPicture.createTime}
                </div>
              </div>
              {selectedPicture.tags && (
                <div className="detail-meta">
                  <div className="meta-item" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                    <strong>标签：</strong>
                    {selectedPicture.tags.split(',').map((tag, index) => (
                      <span key={index} className="tag">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPicture.introduction && (
                <div className="detail-intro">
                  <strong>简介：</strong>
                  {selectedPicture.introduction}
                </div>
              )}
              <div className="detail-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    if (selectedPicture.id) {
                      navigate(`/image-edit/${selectedPicture.id}`, { state: { picture: selectedPicture } });
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 6 }}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  协同编辑
                </button>
                <button
                  className="download-btn"
                  onClick={() => {
                    if (selectedPicture.id) {
                      handleDownload(selectedPicture.id, selectedPicture.name);
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 6 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  下载
                </button>
                <button className="close-btn" onClick={() => setSelectedPicture(null)}>关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showUploadModal && (
        <div className="detail-modal" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h2>上传图片</h2>
            <div className="upload-form">
              <div className="form-group">
                <label>选择文件：</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {uploadFile && <span className="file-name">{uploadFile.name}</span>}
              </div>
              <div className="form-group">
                <label>图片名称：</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="请输入图片名称"
                />
              </div>
              <div className="form-group">
                <label>分类：</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                  <option value="风景">风景</option>
                  <option value="人物">人物</option>
                  <option value="动物">动物</option>
                  <option value="建筑">建筑</option>
                  <option value="科技">科技</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label>标签：</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="请输入标签，用逗号分隔"
                />
              </div>
              <div className="form-group">
                <label>简介：</label>
                <textarea
                  value={uploadIntroduction}
                  onChange={(e) => setUploadIntroduction(e.target.value)}
                  placeholder="请输入图片简介"
                  rows={3}
                />
              </div>
            </div>
            <div className="upload-actions">
              <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>取消</button>
              <button className="confirm-btn" onClick={handleUpload}>上传</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
