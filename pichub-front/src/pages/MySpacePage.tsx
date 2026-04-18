import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listMySpacesUsingGet } from "@/api/spaceController";
import { listSpaceUserVoByPageUsingPost, addSpaceUserUsingPost, deleteSpaceUserUsingPost } from "@/api/spaceUserController";
import { useUser } from "@/contexts/UserContext";
import "./HomePage.css";

interface MySpaceVO {
  id?: number;
  spaceName?: string;
  spaceLevel?: number;
  maxSize?: number;
  maxCount?: number;
  totalSize?: number;
  totalCount?: number;
  spaceRole?: string;
  createTime?: string;
}

interface SpaceUserVO {
  id?: number;
  spaceId?: number;
  userId?: number;
  spaceRole?: string;
  userAccount?: string;
  userName?: string;
}

export default function MySpacePage() {
  const navigate = useNavigate();
  const { loginUser, setLoginUser } = useUser();
  const [mySpaces, setMySpaces] = useState<MySpaceVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeNav, setActiveNav] = useState("myspace");

  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<MySpaceVO | null>(null);
  const [spaceUsers, setSpaceUsers] = useState<SpaceUserVO[]>([]);
  const [memberCurrent, setMemberCurrent] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [memberTotal, setMemberTotal] = useState(0);
  const [memberLoading, setMemberLoading] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

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

  const fetchMySpaces = async () => {
    setLoading(true);
    try {
      const res = await listMySpacesUsingGet();
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        setMySpaces(res.data || []);
      }
    } catch (error) {
      console.error("获取我的空间列表失败", error);
      showMessage("获取空间列表失败", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaceUsers = async () => {
    if (!selectedSpace?.id) return;
    setMemberLoading(true);
    try {
      const res = await listSpaceUserVoByPageUsingPost({
        current: memberCurrent,
        pageSize: memberPageSize,
        spaceId: selectedSpace.id,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        const responseData = res.data as any;
        if (responseData?.records) {
          setSpaceUsers(responseData.records);
          setMemberTotal(responseData.total || 0);
        }
      }
    } catch (error) {
      console.error("获取空间成员列表失败", error);
      showMessage("获取空间成员失败", "error");
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    fetchMySpaces();
  }, []);

  useEffect(() => {
    if (memberModalVisible && selectedSpace) {
      fetchSpaceUsers();
    }
  }, [memberModalVisible, memberCurrent, memberPageSize, selectedSpace]);

  const handleViewMembers = (space: MySpaceVO) => {
    setSelectedSpace(space);
    setMemberCurrent(1);
    setMemberModalVisible(true);
  };

  const handleViewPictures = (spaceId: number) => {
    navigate(`/my-space/${spaceId}/pictures`);
  };

  const handleInviteMember = async () => {
    if (!inviteUserId || !selectedSpace?.id) {
      showMessage("请输入用户ID", "error");
      return;
    }
    try {
      const res = await addSpaceUserUsingPost({
        spaceId: selectedSpace.id,
        userId: Number(inviteUserId),
        spaceRole: inviteRole,
      });

      if (res.code === 0) {
        showMessage("邀请成功");
        setInviteUserId("");
        setInviteRole("viewer");
        fetchSpaceUsers();
      } else {
        showMessage(res.message || "邀请失败", "error");
      }
    } catch (error) {
      console.error("邀请成员失败", error);
      showMessage("邀请失败", "error");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("确定要移除该成员吗？")) return;
    try {
      const res = await deleteSpaceUserUsingPost({ id: memberId });
      if (res.code === 0) {
        showMessage("移除成功");
        fetchSpaceUsers();
      } else {
        showMessage(res.message || "移除失败", "error");
      }
    } catch (error) {
      console.error("移除成员失败", error);
      showMessage("移除失败", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await useUser().setLoginUser(null);
      navigate("/login");
    } catch (error) {
      console.error("登出失败", error);
    }
  };

  const getSpaceLevelText = (level?: number) => {
    switch (level) {
      case 0: return "基础版";
      case 1: return "专业版";
      case 2: return "高级版";
      default: return "未知";
    }
  };

  const getSpaceLevelColor = (level?: number) => {
    switch (level) {
      case 0: return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      case 1: return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
      case 2: return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
      default: return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  };

  const getSpaceLevelIcon = (level?: number) => {
    switch (level) {
      case 0: return "📁";
      case 1: return "💎";
      case 2: return "👑";
      default: return "📁";
    }
  };

  const getSpaceRoleText = (role?: string) => {
    switch (role) {
      case "admin": return "管理员";
      case "editor": return "编辑者";
      case "viewer": return "查看者";
      default: return role || "未知";
    }
  };

  const getSpaceRoleClass = (role?: string) => {
    switch (role) {
      case "admin": return "admin-role";
      case "editor": return "editor-role";
      case "viewer": return "viewer-role";
      default: return "";
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes || isNaN(bytes) || bytes < 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const calculatePercentage = (current?: number, max?: number) => {
    if (!max || max === 0 || isNaN(max)) return 0;
    const currentVal = current || 0;
    if (isNaN(currentVal)) return 0;
    return Math.min(100, Math.max(0, Math.round(currentVal / max * 100)));
  };

  const memberTotalPages = Math.ceil(memberTotal / memberPageSize);

  const totalSpaces = mySpaces.length || 0;
  const totalSizeUsed = mySpaces.reduce((sum, space) => {
    const size = space.totalSize || 0;
    return sum + (isNaN(size) ? 0 : size);
  }, 0);
  const totalSizeMax = mySpaces.reduce((sum, space) => {
    const size = space.maxSize || 0;
    return sum + (isNaN(size) ? 0 : size);
  }, 0);
  const totalCountUsed = mySpaces.reduce((sum, space) => {
    const count = space.totalCount || 0;
    return sum + (isNaN(count) ? 0 : count);
  }, 0);
  const totalCountMax = mySpaces.reduce((sum, space) => {
    const count = space.maxCount || 0;
    return sum + (isNaN(count) ? 0 : count);
  }, 0);

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
            <button onClick={() => navigate("/user-manage")} className="admin-btn">
              管理后台
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            退出登录
          </button>
        </div>
      </header>

      <main className="home-main">
        {/* 统计概览卡片 */}
        <div className="stats-overview">
          <div className="stat-card stat-card-1">
            <div className="stat-icon stat-icon-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">我的空间</p>
              <p className="stat-value">{totalSpaces} 个</p>
            </div>
          </div>
          <div className="stat-card stat-card-2">
            <div className="stat-icon stat-icon-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">总容量使用</p>
              <p className="stat-value">{formatSize(totalSizeUsed)} / {formatSize(totalSizeMax)}</p>
            </div>
          </div>
          <div className="stat-card stat-card-3">
            <div className="stat-icon stat-icon-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">总图片数量</p>
              <p className="stat-value">{totalCountUsed} / {totalCountMax}</p>
            </div>
          </div>
        </div>

        {/* 空间列表 */}
        <div className="spaces-list-container">
          <div className="spaces-list-header">
            <h2>空间列表</h2>
            <p className="spaces-list-subtitle">管理和查看您的所有空间</p>
          </div>
          {loading ? (
            <div className="loading-state">加载中...</div>
          ) : mySpaces.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="17" x2="12" y2="17" />
                </svg>
              </div>
              <p>暂无空间</p>
              <p className="empty-hint">您可以创建或加入一个空间开始使用</p>
            </div>
          ) : (
            <div className="spaces-table-container">
              <table className="spaces-table">
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>空间名称</th>
                    <th style={{ width: "12%" }}>我的权限</th>
                    <th style={{ width: "10%" }}>空间等级</th>
                    <th style={{ width: "25%" }}>容量使用</th>
                    <th style={{ width: "25%" }}>数量使用</th>
                    <th style={{ width: "10%" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mySpaces.map((space) => (
                    <tr key={space.id} className="space-table-row">
                      <td>
                        <div className="table-space-name">
                          <div
                            className="table-space-icon"
                            style={{
                              background: getSpaceLevelColor(space.spaceLevel)
                            }}
                          >
                            <span>{getSpaceLevelIcon(space.spaceLevel)}</span>
                          </div>
                          <div>
                            <div className="table-space-title">{space.spaceName || "未命名"}</div>
                            <div className="table-space-id">ID: {space.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${getSpaceRoleClass(space.spaceRole)}`}>
                          {getSpaceRoleText(space.spaceRole)}
                        </span>
                      </td>
                      <td>
                        <span className="space-level-badge-small">{getSpaceLevelText(space.spaceLevel)}</span>
                      </td>
                      <td>
                        <div className="table-progress">
                          <div className="table-progress-bar">
                            <div
                              className="table-progress-fill"
                              style={{
                                width: `${calculatePercentage(space.totalSize, space.maxSize)}%`,
                                background: getSpaceLevelColor(space.spaceLevel)
                              }}
                            />
                          </div>
                          <span className="table-progress-text">
                            {formatSize(space.totalSize)} / {formatSize(space.maxSize)}
                          </span>
                          <span className="table-progress-percent">
                            {calculatePercentage(space.totalSize, space.maxSize)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="table-progress">
                          <div className="table-progress-bar">
                            <div
                              className="table-progress-fill"
                              style={{
                                width: `${calculatePercentage(space.totalCount, space.maxCount)}%`,
                                background: getSpaceLevelColor(space.spaceLevel)
                              }}
                            />
                          </div>
                          <span className="table-progress-text">
                            {(space.totalCount || 0)} / {(space.maxCount || 0)}
                          </span>
                          <span className="table-progress-percent">
                            {calculatePercentage(space.totalCount, space.maxCount)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-action-btn view-table-btn"
                            onClick={() => space.id && handleViewPictures(space.id)}
                            title="查看照片"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {space.spaceRole === 'admin' && (
                            <button
                              className="table-action-btn edit-table-btn"
                              onClick={() => handleViewMembers(space)}
                              title="人员管理"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {memberModalVisible && selectedSpace && (
        <div className="modal-overlay" onClick={() => setMemberModalVisible(false)}>
          <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
            <h2>空间成员 - {selectedSpace.spaceName}</h2>
            <div className="member-header">
              <h3>邀请成员</h3>
              <div className="invite-input-group">
                <input
                  type="number"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  placeholder="输入用户ID"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="viewer">查看者</option>
                  <option value="editor">编辑者</option>
                  <option value="admin">管理员</option>
                </select>
                <button className="invite-btn" onClick={handleInviteMember}>邀请</button>
              </div>
            </div>
            <div className="member-table-container">
              <table className="member-table">
                <thead>
                  <tr>
                    <th>用户ID</th>
                    <th>用户账号</th>
                    <th>用户名称</th>
                    <th>角色</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {memberLoading ? (
                    <tr>
                      <td colSpan={5} className="loading-cell">加载中...</td>
                    </tr>
                  ) : spaceUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">暂无成员</td>
                    </tr>
                  ) : (
                    spaceUsers.map((member) => (
                      <tr key={member.id}>
                        <td>{member.userId}</td>
                        <td>{member.userAccount}</td>
                        <td>{member.userName}</td>
                        <td>
                          <span className={`role-badge ${getSpaceRoleClass(member.spaceRole)}`}>
                            {getSpaceRoleText(member.spaceRole)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="remove-btn"
                            onClick={() => member.id && handleRemoveMember(member.id)}
                          >
                            移除
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
                共 {memberTotal} 条成员记录，第 {memberCurrent}/{memberTotalPages || 1} 页
              </span>
              <div className="pagination-buttons">
                <button disabled={memberCurrent === 1} onClick={() => setMemberCurrent(1)}>首页</button>
                <button disabled={memberCurrent === 1} onClick={() => setMemberCurrent(memberCurrent - 1)}>上一页</button>
                <button disabled={memberCurrent >= memberTotalPages} onClick={() => setMemberCurrent(memberCurrent + 1)}>下一页</button>
                <button disabled={memberCurrent >= memberTotalPages} onClick={() => setMemberCurrent(memberTotalPages)}>末页</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setMemberModalVisible(false)}>关闭</button>
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
