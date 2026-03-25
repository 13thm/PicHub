import { useNavigate } from "react-router-dom";
import { userLogoutUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUser();

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

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>PicHub</h1>
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
          <button onClick={handleLogout} className="logout-btn">
            退出登录
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          <h2>欢迎回来，{loginUser?.userName || loginUser?.userAccount || "用户"}</h2>
          <p>管理您的图片收藏</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">0</span>
              <span className="stat-label">图片总数</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">0</span>
              <span className="stat-label">收藏数量</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">0</span>
              <span className="stat-label">相册数量</span>
            </div>
          </div>
        </div>

        <div className="action-grid">
          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3>上传图片</h3>
            <p>上传新图片到您的收藏</p>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3>浏览图片</h3>
            <p>浏览和管理您的图片</p>
          </div>
          <div className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <h3>标签管理</h3>
            <p>整理和分类您的图片</p>
          </div>
        </div>
      </main>
    </div>
  );
}
