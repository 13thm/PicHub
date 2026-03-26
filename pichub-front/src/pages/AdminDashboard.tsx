import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginUserUsingGet, userLogoutUsingPost, listUserVoByPageUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./AdminDashboard.css";

interface DashboardStats {
  userCount: number;
  pictureCount: number;
  spaceSize: number;
  pendingReview: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    pictureCount: 0,
    spaceSize: 0,
    pendingReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const menuItems = [
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
    if (key === "userManage") {
      navigate("/user-manage");
    } else if (key === "pictureManage") {
      navigate("/manage/picture");
    } else if (key === "pictureReview") {
      navigate("/manage/picture-review");
    } else if (key === "spaceManage") {
      navigate("/manage/space");
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const userRes = await listUserVoByPageUsingPost({
        current: 1,
        pageSize: 1,
      });
      // @ts-ignore
      setStats(prev => ({
        ...prev,
        userCount: userRes.data?.total || 0,
        pictureCount: 0,
        spaceSize: 0,
        pendingReview: 0,
      }));
    } catch (error) {
      console.error("获取统计数据失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
        <header className="manage-header">
          <div className="header-left">
            <h1>管理后台</h1>
          </div>
          <div className="header-right">
            <button onClick={handleBackToUser} className="back-btn">
              返回用户端
            </button>
            <button onClick={handleLogout} className="logout-btn">
              退出登录
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{loading ? "-" : stats.userCount}</span>
                <span className="stat-label">用户总数</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pictures">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{loading ? "-" : stats.pictureCount}</span>
                <span className="stat-label">图片总数</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon space">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{loading ? "-" : `${(stats.spaceSize / 1024 / 1024 / 1024).toFixed(2)} GB`}</span>
                <span className="stat-label">空间使用</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{loading ? "-" : stats.pendingReview}</span>
                <span className="stat-label">待审核</span>
              </div>
            </div>
          </div>

          <div className="dashboard-info">
            <div className="info-card current-user">
              <h3>当前登录用户</h3>
              <div className="user-info">
                <img
                  src={loginUser?.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginUser?.userAccount}`}
                  alt="avatar"
                  className="current-avatar"
                />
                <div className="user-details">
                  <span className="user-name">{loginUser?.userName || "未设置昵称"}</span>
                  <span className="user-account">{loginUser?.userAccount}</span>
                  <span className={`user-role ${loginUser?.userRole}`}>
                    {loginUser?.userRole === "admin" ? "管理员" : "普通用户"}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-card system-info">
              <h3>系统信息</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">用户角色:</span>
                  <span className="info-value">{loginUser?.userRole === "admin" ? "管理员" : "普通用户"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">用户ID:</span>
                  <span className="info-value">{loginUser?.id || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
