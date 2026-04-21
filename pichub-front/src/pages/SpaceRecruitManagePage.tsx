import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queryRecruitUsingPost, deleteRecruitUsingPost, updateRecruitUsingPost, addRecruitUsingPost } from "@/api/spaceRecruitController";
import { useUser } from "@/contexts/UserContext";
import "./HomePage.css";

interface SpaceRecruitVO {
  id?: number;
  spaceId?: number;
  spaceName?: string;
  spaceLevel?: number;
  userId?: number;
  publisherName?: string;
  publisherAccount?: string;
  title?: string;
  content?: string;
  recruitStatus?: number;
  maxApplyCount?: number;
  totalApplyCount?: number;
  createTime?: string;
}

export default function SpaceRecruitManagePage() {
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const [recruits, setRecruits] = useState<SpaceRecruitVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeNav, setActiveNav] = useState("admin");

  // 招募管理弹窗
  const [recruitModalVisible, setRecruitModalVisible] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState<SpaceRecruitVO | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    recruitStatus: 0,
    maxApplyCount: 5,
  });

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleNavClick = (nav: string) => {
    setActiveNav(nav);
    if (nav === "admin") {
      navigate("/admin");
    }
  };

  const fetchRecruits = async () => {
    setLoading(true);
    try {
      const res = await queryRecruitUsingPost({
        current,
        pageSize,
        searchText: searchText || undefined,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        const responseData = res.data as any;
        if (responseData?.records) {
          setRecruits(responseData.records);
          setTotal(responseData.total || 0);
        }
      }
    } catch (error) {
      console.error("获取招募列表失败", error);
      showMessage("获取招募列表失败", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruits();
  }, [current, pageSize]);

  const handleSearch = () => {
    setCurrent(1);
    fetchRecruits();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条招募吗？")) return;
    try {
      const res = await deleteRecruitUsingPost({ id });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage("删除成功");
        fetchRecruits();
      } else {
        showMessage(res?.message || "删除失败", "error");
      }
    } catch (error) {
      console.error("删除失败", error);
      showMessage("删除失败", "error");
    }
  };

  const handleSaveRecruit = async () => {
    if (!formData.title.trim()) {
      showMessage("请输入招募标题", "error");
      return;
    }
    try {
      let res;
      if (selectedRecruit?.id) {
        // 更新
        res = await updateRecruitUsingPost({
          id: selectedRecruit.id,
          title: formData.title,
          content: formData.content,
          recruitStatus: formData.recruitStatus,
          maxApplyCount: formData.maxApplyCount,
        });
      } else {
        // 新增
        res = await addRecruitUsingPost({
          spaceId: 0, // 这里需要实际的空间ID，暂时设为0
          title: formData.title,
          content: formData.content,
          maxApplyCount: formData.maxApplyCount,
        });
      }

      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage(selectedRecruit?.id ? "更新成功" : "创建成功");
        setRecruitModalVisible(false);
        fetchRecruits();
      } else {
        showMessage(res?.message || "操作失败", "error");
      }
    } catch (error) {
      console.error("操作失败", error);
      showMessage("操作失败", "error");
    }
  };

  const openRecruitModal = (recruit?: SpaceRecruitVO) => {
    if (recruit) {
      setSelectedRecruit(recruit);
      setFormData({
        title: recruit.title || "",
        content: recruit.content || "",
        recruitStatus: recruit.recruitStatus || 0,
        maxApplyCount: recruit.maxApplyCount || 5,
      });
    } else {
      setSelectedRecruit(null);
      setFormData({
        title: "",
        content: "",
        recruitStatus: 0,
        maxApplyCount: 5,
      });
    }
    setRecruitModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      useUser().setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const getRecruitStatusText = (status?: number) => {
    switch (status) {
      case 0: return "招募中";
      case 1: return "已招满";
      case 2: return "已关闭";
      default: return "未知";
    }
  };

  const getRecruitStatusClass = (status?: number) => {
    switch (status) {
      case 0: return "status-recruiting";
      case 1: return "status-full";
      case 2: return "status-closed";
      default: return "";
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>PicHub 管理后台</h1>
          <nav className="header-nav">
            <button
              className={`nav-item ${activeNav === "admin" ? "active" : ""}`}
              onClick={() => handleNavClick("admin")}
            >
              管理面板
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/user-manage")}
            >
              用户管理
            </button>
            <button
              className="nav-item active"
            >
              招募管理
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/manage/space")}
            >
              空间管理
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
            <span className="user-name">{loginUser?.userName || "管理员"}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            退出登录
          </button>
        </div>
      </header>

      <main className="home-main">
        {/* 搜索栏 */}
        <div className="search-bar">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索招募信息..."
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            🔍 搜索
          </button>
        </div>

        {/* 招募管理列表 */}
        <div className="spaces-list-container">
          <div className="spaces-list-header">
            <h2>招募管理</h2>
            <p className="spaces-list-subtitle">管理所有空间招募信息</p>
          </div>
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : recruits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>暂无招募信息</p>
              <p className="empty-hint">暂没有任何招募记录</p>
            </div>
          ) : (
            <div className="spaces-table-container">
              <table className="spaces-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>ID</th>
                    <th style={{ width: "20%" }}>空间名称</th>
                    <th style={{ width: "20%" }}>招募标题</th>
                    <th style={{ width: "15%" }}>发布人</th>
                    <th style={{ width: "10%" }}>状态</th>
                    <th style={{ width: "10%" }}>申请数</th>
                    <th style={{ width: "10%" }}>名额</th>
                    <th style={{ width: "10%" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {recruits.map((recruit) => (
                    <tr key={recruit.id} className="space-table-row">
                      <td>{recruit.id}</td>
                      <td>{recruit.spaceName}</td>
                      <td>{recruit.title}</td>
                      <td>{recruit.publisherName}</td>
                      <td>
                        <span className={`recruit-status ${getRecruitStatusClass(recruit.recruitStatus)}`}>
                          {getRecruitStatusText(recruit.recruitStatus)}
                        </span>
                      </td>
                      <td>{recruit.totalApplyCount || 0}</td>
                      <td>{recruit.maxApplyCount || 5}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-action-btn delete-table-btn"
                            onClick={() => recruit.id && handleDelete(recruit.id)}
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="total-text">
                共 {total} 条记录，第 {current}/{totalPages} 页
              </span>
              <div className="pagination-buttons">
                <button disabled={current === 1} onClick={() => setCurrent(1)}>首页</button>
                <button disabled={current === 1} onClick={() => setCurrent(current - 1)}>上一页</button>
                <button disabled={current >= totalPages} onClick={() => setCurrent(current + 1)}>下一页</button>
                <button disabled={current >= totalPages} onClick={() => setCurrent(totalPages)}>末页</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
