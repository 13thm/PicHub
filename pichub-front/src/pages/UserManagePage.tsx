import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  listUserVoByPageUsingPost, 
  deleteUserUsingPost, 
  userLogoutUsingPost 
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

export default function UserManagePage() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
  const [users, setUsers] = useState<UserVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await listUserVoByPageUsingPost({
        current,
        pageSize,
        searchText: searchText || undefined,
      });
      if (res.code === 0 && res.data?.records) {
        setUsers(res.data.records);
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
  }, [current, pageSize]);

  const handleSearch = () => {
    setCurrent(1);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该用户吗？")) return;
    try {
      const res = await deleteUserUsingPost({ id });
      if (res.code === 0) {
        alert("删除成功");
        fetchUsers();
      } else {
        alert(res.message || "删除失败");
      }
    } catch (error) {
      console.error("删除用户失败", error);
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="manage-container">
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

      <main className="manage-main">
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
                      <button
                        className="delete-btn"
                        onClick={() => user.id && handleDelete(user.id)}
                      >
                        删除
                      </button>
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
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrent(1);
            }}
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        </div>
      </main>
    </div>
  );
}
