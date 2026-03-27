import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userLogoutUsingPost } from "@/api/userController";
import { listPictureVoByPageUsingPost, uploadPictureUsingPost } from "@/api/pictureController";
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
  picFormat?: string;
  reviewStatus?: number;
  userId?: number;
  createTime?: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUser();
  const [pictures, setPictures] = useState<PictureVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [selectedPicture, setSelectedPicture] = useState<PictureVO | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadData, setUploadData] = useState({ name: "", category: "", tags: "", introduction: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    if (nav === "home") {
      navigate("/home");
    } else if (nav === "square") {
      navigate("/space-square");
    } else if (nav === "myspace") {
      navigate("/my-space");
    }
  };

  const fetchPictures = async () => {
    setLoading(true);
    try {
      const res = await listPictureVoByPageUsingPost({
        current,
        pageSize,
        searchField: searchText || undefined,
        category: category || undefined,
        reviewStatus: 1,
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

  const handleLogout = async () => {
    try {
      await userLogoutUsingPost();
      setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const handleGoToAdmin = () => {
    navigate("/user-manage");
  };

  const handleSearch = () => {
    setCurrent(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrent(1);
  };

  const handleDownload = (picture: PictureVO) => {
    if (!picture.url) return;
    const link = document.createElement('a');
    link.href = picture.url;
    link.target = '_blank';
    link.download = `${picture.name || 'image'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.name) {
      alert("请选择图片并填写名称");
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
        alert("上传成功，请等待审核");
        setUploadModalVisible(false);
        setUploadData({ name: "", category: "", tags: "", introduction: "" });
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPictures();
      } else {
        // @ts-ignore
        alert(res.message || "上传失败");
      }
    } catch (error) {
      console.error("上传图片失败", error);
      alert("上传失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件");
        return;
      }
      setUploadFile(file);
      if (!uploadData.name) {
        setUploadData({ ...uploadData, name: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>PicHub</h1>
          <nav className="header-nav">
            <button 
              className={`nav-item ${activeNav === "home" ? "active" : ""}`}
              onClick={() => handleNavClick("home")}
            >
              首页
            </button>
            <button 
              className={`nav-item ${activeNav === "square" ? "active" : ""}`}
              onClick={() => handleNavClick("square")}
            >
              空间广场
            </button>
            <button 
              className={`nav-item ${activeNav === "myspace" ? "active" : ""}`}
              onClick={() => handleNavClick("myspace")}
            >
              我的空间
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            <img 
              src={loginUser?.userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + loginUser?.userAccount} 
              alt="avatar" 
              className="user-avatar"
            />
            <span className="user-name">{loginUser?.userName || loginUser?.userAccount || "用户"}</span>
          </div>
          {loginUser?.userRole === "admin" && (
            <button onClick={handleGoToAdmin} className="admin-btn">
              管理后台
            </button>
          )}
          <button onClick={() => setUploadModalVisible(true)} className="upload-btn">
            上传图片
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
            <button onClick={handleSearch} className="search-btn">搜索</button>
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
                <div key={picture.id} className="picture-card" onClick={() => setSelectedPicture(picture)}>
                  <div className="picture-image">
                    <img src={picture.thumbnailUrl || picture.url} alt={picture.name} />
                    <div className="picture-overlay">
                      <button className="view-btn" onClick={(e) => { e.stopPropagation(); setSelectedPicture(picture); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        查看详情
                      </button>
                      <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleDownload(picture); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        下载
                      </button>
                    </div>
                  </div>
                  <div className="picture-info">
                    <h3 className="picture-name">{picture.name}</h3>
                    <p className="picture-category">{picture.category || "未分类"}</p>
                    {picture.tags && (
                      <div className="picture-tags">
                        {picture.tags.split(",").slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="pagination">
            <span className="total-text">共 {total} 张图片，第 {current}/{totalPages || 1} 页</span>
            <div className="pagination-buttons">
              <button disabled={current === 1} onClick={() => setCurrent(1)}>首页</button>
              <button disabled={current === 1} onClick={() => setCurrent(current - 1)}>上一页</button>
              <button disabled={current >= totalPages} onClick={() => setCurrent(current + 1)}>下一页</button>
              <button disabled={current >= totalPages} onClick={() => setCurrent(totalPages)}>末页</button>
            </div>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value={20}>20条/页</option>
              <option value={40}>40条/页</option>
              <option value={60}>60条/页</option>
            </select>
          </div>
        )}
      </main>

      {selectedPicture && (
        <div className="detail-modal" onClick={() => setSelectedPicture(null)}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPicture.url || selectedPicture.thumbnailUrl} alt={selectedPicture.name} className="detail-image" />
            <div className="detail-info">
              <h2>{selectedPicture.name}</h2>
              <div className="detail-meta">
                <span className="meta-item">分类: {selectedPicture.category || "未分类"}</span>
                <span className="meta-item">标签: {selectedPicture.tags || "无"}</span>
                <span className="meta-item">上传时间: {selectedPicture.createTime || "未知"}</span>
              </div>
              <p className="detail-intro">{selectedPicture.introduction || "暂无简介"}</p>
              <div className="detail-actions">
                <button className="download-btn" onClick={() => handleDownload(selectedPicture)}>下载图片</button>
                <button className="close-btn" onClick={() => setSelectedPicture(null)}>关闭</button>
              </div>
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
              {uploadFile && <div className="file-preview">{uploadFile.name}</div>}
            </div>
            <div className="form-group">
              <label>图片名称 *</label>
              <input type="text" value={uploadData.name} onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })} placeholder="请输入图片名称" />
            </div>
            <div className="form-group">
              <label>分类</label>
              <select value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}>
                <option value="">请选择分类</option>
                <option value="wallpaper">壁纸</option>
                <option value="avatar">头像</option>
                <option value="photo">照片</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div className="form-group">
              <label>标签</label>
              <input type="text" value={uploadData.tags} onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })} placeholder="多个标签用逗号分隔" />
            </div>
            <div className="form-group">
              <label>简介</label>
              <textarea value={uploadData.introduction} onChange={(e) => setUploadData({ ...uploadData, introduction: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setUploadModalVisible(false)}>取消</button>
              <button className="submit-btn" onClick={handleUpload} disabled={loading}>上传</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
