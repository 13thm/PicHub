import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  listUserVoByPageUsingPost, 
  deleteUserUsingPost, 
  userLogoutUsingPost,
  updateUserUsingPost
} from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./UserManagePage.css";

interface UserVO {
  id?: number;
  userAccount?: string;
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userRole?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function UserManagePage() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
  const [users, setUsers] = useState<UserVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("userManage");
  const [editingUser, setEditingUser] = useState<UserVO | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  const handleEdit = (user: UserVO) => {
    setEditingUser({ ...user });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser || !editingUser.id) return;
    try {
      const res = await updateUserUsingPost({
        id: editingUser.id,
        userName: editingUser.userName,
        userAvatar: editingUser.userAvatar,
        userProfile: editingUser.userProfile,
        userRole: editingUser.userRole,
      });
      // @ts-ignore
      if (res.code === 0) {
        showMessage("修改成功");
        setEditModalVisible(false);
        fetchUsers();
      } else {
        // @ts-ignore
        showMessage(res.message || "修改失败", "error");
      }
    } catch (error) {
      console.error("修改用户失败", error);
      showMessage("修改失败", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该用户吗？")) return;
    try {
      const res = await deleteUserUsingPost({ id });
      // @ts-ignore
      if (res.code === 0) {
        showMessage("删除成功");
        fetchUsers();
      } else {
        // @ts-ignore
        showMessage(res.message || "删除失败", "error");
      }
    } catch (error) {
      console.error("删除用户失败", error);
      showMessage("删除失败", "error");
    }
  };

  const handleMenuClick = (key: string) => {
    setActiveMenu(key);
    if (key === "dashboard") {
      navigate("/admin");
    } else if (key === "userManage") {
      navigate("/user-manage");
    } else if (key === "pictureManage") {
      navigate("/manage/picture");
    } else if (key === "pictureReview") {
      navigate("/manage/picture-review");
    } else if (key === "spaceManage") {
      navigate("/manage/space");
    } else if (key === "recruitManage") {
      navigate("/space_recruit-manage");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await listUserVoByPageUsingPost({
        current,
        pageSize,
        searchText: searchText || undefined,
      });
      // @ts-ignore
      if (res.code === 0 && res.data?.records) {
        // @ts-ignore
        setUsers(res.data.records);
        // @ts-ignore
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error("获取用户列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [current, pageSize, searchText]);

  const handleSearch = () => {
    setCurrent(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrent(1);
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
            <h1>用户管理</h1>
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

        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索用户名..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">
            搜索
          </button>
        </div>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>头像</th>
                <th>用户名</th>
                <th>账号</th>
                <th>角色</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="loading-cell">
                    加载中...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    暂无数据
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <img
                        src={user.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userAccount}`}
                        alt="avatar"
                        className="table-avatar"
                      />
                    </td>
                    <td>{user.userName || "-"}</td>
                    <td>{user.userAccount}</td>
                    <td>
                      <span className={`role-badge ${user.userRole}`}>
                        {user.userRole === "admin" ? "管理员" : "普通用户"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(user)}
                        >
                          修改
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => user.id && handleDelete(user.id)}
                        >
                          删除
                        </button>
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
            <button
              disabled={current === 1}
              onClick={() => setCurrent(1)}
            >
              首页
            </button>
            <button
              disabled={current === 1}
              onClick={() => setCurrent(current - 1)}
            >
              上一页
            </button>
            <button
              disabled={current >= totalPages}
              onClick={() => setCurrent(current + 1)}
            >
              下一页
            </button>
            <button
              disabled={current >= totalPages}
              onClick={() => setCurrent(totalPages)}
            >
              末页
            </button>
          </div>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        </div>

        {editModalVisible && editingUser && (
          <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>修改用户</h2>
              <div className="form-group">
                <label>用户名</label>
                <input
                  type="text"
                  value={editingUser.userName || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, userName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>头像URL</label>
                <input
                  type="text"
                  value={editingUser.userAvatar || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, userAvatar: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>个人简介</label>
                <textarea
                  value={editingUser.userProfile || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, userProfile: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>角色</label>
                <select
                  value={editingUser.userRole || "user"}
                  onChange={(e) => setEditingUser({ ...editingUser, userRole: e.target.value })}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setEditModalVisible(false)}>
                  取消
                </button>
                <button className="submit-btn" onClick={handleEditSubmit}>
                  提交
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
