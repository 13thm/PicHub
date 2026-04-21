import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listRecruitVoByPageUsingPost } from "@/api/spaceRecruitController";
import { addApplyUsingPost } from "@/api/spaceRecruitApplyController";
import { useUser } from "@/contexts/UserContext";
import "./HomePage.css";

interface SpaceRecruitVO {
  id?: number;
  spaceId?: number;
  spaceName?: string;
  spaceLevel?: number;
  spaceType?: number;
  userId?: number;
  publisherName?: string;
  publisherAccount?: string;
  title?: string;
  content?: string;
  recruitStatus?: number;
  maxApplyCount?: number;
  applyCount?: number;
  pendingCount?: number;
  totalApplyCount?: number;
  createTime?: string;
}

export default function SpaceSquarePage() {
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const [recruits, setRecruits] = useState<SpaceRecruitVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeNav, setActiveNav] = useState("square");
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState<SpaceRecruitVO | null>(null);
  const [applyReason, setApplyReason] = useState("");

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

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

  const fetchRecruits = async () => {
    setLoading(true);
    try {
      const res = await listRecruitVoByPageUsingPost({
        current,
        pageSize,
        searchText: searchText || undefined,
      });
      if (typeof res === 'object' && res !== null && 'code' in res) {
        if (res.code === 0) {
          const responseData = res.data as any;
          if (responseData?.records) {
            setRecruits(responseData.records);
            setTotal(responseData.total || 0);
          } else {
            setRecruits([]);
            setTotal(0);
          }
        } else {
          console.error("API返回错误:", res.message);
          setRecruits([]);
          setTotal(0);
          showMessage(res.message || "获取招募列表失败", "error");
        }
      } else {
        console.error("无效的API响应格式");
        setRecruits([]);
        setTotal(0);
        showMessage("获取招募列表失败", "error");
      }
    } catch (error) {
      console.error("获取招募列表失败", error);
      setRecruits([]);
      setTotal(0);
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

  const handleApply = async () => {
    if (!selectedRecruit?.id) {
      showMessage("请选择招募", "error");
      return;
    }
    if (!applyReason.trim()) {
      showMessage("请填写申请理由", "error");
      return;
    }
    try {
      const res = await addApplyUsingPost({
        recruitId: selectedRecruit.id,
        applyReason,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage("申请成功");
        setApplyModalVisible(false);
        setApplyReason("");
        fetchRecruits();
      } else {
        showMessage(res?.message || "申请失败", "error");
      }
    } catch (error) {
      console.error("申请失败", error);
      showMessage("申请失败", "error");
    }
  };

  const handleLogout = async () => {
    try {
      useUser().setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const handleGoToAdmin = () => {
    navigate("/admin");
  };

  const openApplyModal = (recruit: SpaceRecruitVO) => {
    setSelectedRecruit(recruit);
    setApplyModalVisible(true);
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

        {/* 招募列表 */}
        <div className="spaces-list-container">
          <div className="spaces-list-header">
            <h2>空间广场</h2>
          </div>
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : recruits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>暂无招募信息</p>
              <p className="empty-hint">换个关键词试试吧</p>
            </div>
          ) : (
            <div className="recruit-grid">
              {recruits.map((recruit) => (
                <div key={recruit.id} className="recruit-card">
                  <div className="recruit-card-header">
                    <div className="recruit-space-info">
                      <div className="recruit-space-name">{recruit.spaceName}</div>
                      <div className="recruit-publisher">发布者: {recruit.publisherName}</div>
                    </div>
                    <span className={`recruit-status ${getRecruitStatusClass(recruit.recruitStatus)}`}>
                      {getRecruitStatusText(recruit.recruitStatus)}
                    </span>
                  </div>
                  <div className="recruit-card-body">
                    <h3 className="recruit-title">{recruit.title}</h3>
                    <p className="recruit-content">{recruit.content || "暂无描述"}</p>
                    <div className="recruit-stats">
                      <div className="recruit-stat">
                        <span className="stat-label">已接受</span>
                        <span className="stat-value">{recruit.applyCount || 0}人</span>
                      </div>
                      <div className="recruit-stat">
                        <span className="stat-label">名额</span>
                        <span className="stat-value">{recruit.maxApplyCount || 5}人</span>
                      </div>
                    </div>
                    {recruit.maxApplyCount && recruit.maxApplyCount > 0 && (
                      <div className="recruit-progress">
                        <div className="progress-bar-wrapper">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.min(100, ((recruit.applyCount || 0) / recruit.maxApplyCount) * 100)}%`,
                                backgroundColor: (recruit.applyCount || 0) >= recruit.maxApplyCount ? '#10b981' : '#667eea'
                              }}
                            />
                          </div>
                          <span className="progress-percent">{recruit.applyCount || 0}/{recruit.maxApplyCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="recruit-card-footer">
                    <button
                      className="square-apply-btn"
                      onClick={() => openApplyModal(recruit)}
                      disabled={recruit.recruitStatus !== 0}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      申请加入
                    </button>
                  </div>
                </div>
              ))}
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

      {/* 申请弹窗 */}
      {applyModalVisible && selectedRecruit && (
        <div className="modal-overlay" onClick={() => setApplyModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>申请加入 - {selectedRecruit.spaceName}</h2>
            <div className="modal-body">
              <div className="apply-preview">
                <div className="preview-title">{selectedRecruit.title}</div>
                <div className="preview-content">{selectedRecruit.content || "暂无描述"}</div>
              </div>
              <div className="form-group">
                <label>申请理由</label>
                <textarea
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  placeholder="请说明您想加入该空间的原因..."
                  rows={4}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setApplyModalVisible(false)}>取消</button>
              <button className="confirm-btn" onClick={handleApply}>提交申请</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
