import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listMySpacesUsingGet, addSpaceUsingPost } from "@/api/spaceController";
import { listSpaceUserVoByPageUsingPost, addSpaceUserUsingPost, deleteSpaceUserUsingPost } from "@/api/spaceUserController";
import { addRecruitUsingPost, listMyRecruitsUsingPost } from "@/api/spaceRecruitController";
import { getPendingCountUsingGet, listApplyVoByPageUsingPost, reviewApplyUsingPost } from "@/api/spaceRecruitApplyController";
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

  // 招募申请相关状态
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyList, setApplyList] = useState<any[]>([]);
  const [applyCurrent, setApplyCurrent] = useState(1);
  const [applyPageSize, setApplyPageSize] = useState(10);
  const [applyTotal, setApplyTotal] = useState(0);
  const [applyLoading, setApplyLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 发布招募相关状态
  const [recruitModalVisible, setRecruitModalVisible] = useState(false);
  const [recruitData, setRecruitData] = useState({
    title: "",
    content: "",
    maxApplyCount: 5,
  });

  // 创建空间相关状态
  const [createSpaceModalVisible, setCreateSpaceModalVisible] = useState(false);
  const [newSpaceData, setNewSpaceData] = useState({
    spaceName: "",
    spaceLevel: 0,
  });

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleCreateSpace = async () => {
    if (!newSpaceData.spaceName.trim()) {
      showMessage("请输入空间名称", "error");
      return;
    }

    try {
      const res = await addSpaceUsingPost(newSpaceData);
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage("创建空间成功");
        setCreateSpaceModalVisible(false);
        setNewSpaceData({ spaceName: "", spaceLevel: 0 });
        fetchMySpaces();
      } else {
        showMessage(res?.message || "创建空间失败", "error");
      }
    } catch (error) {
      console.error("创建空间失败", error);
      showMessage("创建空间失败", "error");
    }
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
    // 获取所有管理空间的待审批数量
    const fetchTotalPendingCount = async () => {
      const adminSpaces = mySpaces.filter(s => s.spaceRole === 'admin');
      let totalCount = 0;
      for (const space of adminSpaces) {
        try {
          const res = await getPendingCountUsingGet({ spaceId: space.id });
          if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
            totalCount += res.data || 0;
          }
        } catch (error) {
          console.error("获取待审批数量失败", error);
        }
      }
      setPendingCount(totalCount);
    };
    fetchTotalPendingCount();
  }, [mySpaces]);

  useEffect(() => {
    if (memberModalVisible && selectedSpace) {
      fetchSpaceUsers();
    }
  }, [memberModalVisible, memberCurrent, memberPageSize, selectedSpace]);

  // 获取待审批数量
  const fetchPendingCount = async () => {
    if (!selectedSpace?.id) return;
    try {
      const res = await getPendingCountUsingGet({ spaceId: selectedSpace.id });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        setPendingCount(res.data || 0);
      }
    } catch (error) {
      console.error("获取待审批数量失败", error);
    }
  };

  // 获取申请列表
  const fetchApplyList = async (spaceId?: number) => {
    const targetSpaceId = spaceId || selectedSpace?.id;
    if (!targetSpaceId) return;
    setApplyLoading(true);
    try {
      const res = await listApplyVoByPageUsingPost({
        current: applyCurrent,
        pageSize: applyPageSize,
        spaceId: targetSpaceId,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        const responseData = res.data as any;
        if (responseData?.records) {
          setApplyList(responseData.records);
          setApplyTotal(responseData.total || 0);
        }
      }
    } catch (error) {
      console.error("获取申请列表失败", error);
      showMessage("获取申请列表失败", "error");
    } finally {
      setApplyLoading(false);
    }
  };

  // 审批申请
  const handleReviewApply = async (apply: any, approve: boolean) => {
    try {
      const res = await reviewApplyUsingPost({
        id: apply.id,
        applyStatus: approve ? 1 : 2,
        reviewMessage: approve ? "审批通过" : "申请被拒绝",
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage(approve ? "已通过申请" : "已拒绝申请", "success");
        fetchApplyList();
        fetchPendingCount();
      } else {
        showMessage(res?.message || "审批失败", "error");
      }
    } catch (error) {
      console.error("审批失败", error);
      showMessage("审批失败", "error");
    }
  };

  // 打开申请列表（查看申请消息）
  const handleOpenApplyList = (space: MySpaceVO) => {
    if (space.spaceRole !== 'admin') {
      showMessage("只有管理员可以查看申请", "error");
      return;
    }
    setSelectedSpace(space);
    setApplyCurrent(1);
    setApplyModalVisible(true);
    fetchPendingCount();
    fetchApplyList(space.id);
  };

  // 打开招募管理弹窗
  const handleOpenRecruitManage = (space: MySpaceVO) => {
    if (space.spaceRole !== 'admin') {
      showMessage("只有管理员可以查看招募管理", "error");
      return;
    }
    setSelectedSpace(space);
    setApplyCurrent(1);
    setApplyModalVisible(true);
    fetchPendingCount();
    fetchApplyList(space.id);
  };

  // 打开发布招募弹窗
  const handleOpenPublishRecruit = (space: MySpaceVO) => {
    if (space.spaceRole !== 'admin') {
      showMessage("只有管理员可以发布招募", "error");
      return;
    }
    setSelectedSpace(space);
    setRecruitModalVisible(true);
  };

  // 发布招募到广场
  const handlePublishRecruit = async () => {
    if (!recruitData.title.trim()) {
      showMessage("请填写招募标题", "error");
      return;
    }
    if (!selectedSpace?.id) {
      showMessage("请选择空间", "error");
      return;
    }
    try {
      const res = await addRecruitUsingPost({
        spaceId: selectedSpace.id,
        title: recruitData.title,
        content: recruitData.content,
        maxApplyCount: recruitData.maxApplyCount,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        showMessage("已发布到广场", "success");
        setRecruitModalVisible(false);
        setRecruitData({ title: "", content: "", maxApplyCount: 5 });
      } else {
        showMessage(res?.message || "发布失败", "error");
      }
    } catch (error) {
      console.error("发布招募失败", error);
      showMessage("发布招募失败", "error");
    }
  };

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

          {/* 消息图标 - 显示待审批数量 */}
          <button
            onClick={() => {
              if (mySpaces.length > 0) {
                handleOpenApplyList(mySpaces[0]);
              } else {
                showMessage("暂无空间", "error");
              }
            }}
            className="message-btn"
            title="申请消息"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {pendingCount > 0 && (
              <span className="message-badge">{pendingCount}</span>
            )}
          </button>

          {loginUser?.userRole === "admin" && (
            <button onClick={() => navigate("/admin")} className="admin-btn">
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
            <div>
              <h2>空间列表</h2>
              <p className="spaces-list-subtitle">管理和查看您的所有空间</p>
            </div>
            {!loading && mySpaces.length > 0 && (
              <button
                className="action-btn primary-btn"
                onClick={() => setCreateSpaceModalVisible(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                创建空间
              </button>
            )}
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
              <button
                className="action-btn primary-btn"
                style={{ marginTop: 20 }}
                onClick={() => setCreateSpaceModalVisible(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                创建我的第一个空间
              </button>
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
                            <>
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
                              <button
                                className="table-action-btn recruit-manage-table-btn"
                                onClick={() => handleOpenRecruitManage(space)}
                                title="招募管理"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                className="table-action-btn recruit-publish-table-btn"
                                onClick={() => handleOpenPublishRecruit(space)}
                                title="发布招募到广场"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="16" />
                                  <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                              </button>
                            </>
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

      {applyModalVisible && selectedSpace && (
        <div className="modal-overlay" onClick={() => setApplyModalVisible(false)}>
          <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
            <h2>招募管理 - {selectedSpace.spaceName}</h2>
            <div className="member-table-container">
              <table className="member-table">
                <thead>
                  <tr>
                    <th>申请人</th>
                    <th>申请理由</th>
                    <th>申请时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {applyLoading ? (
                    <tr>
                      <td colSpan={5} className="loading-cell">加载中...</td>
                    </tr>
                  ) : applyList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">暂无申请</td>
                    </tr>
                  ) : (
                    applyList.map((apply) => {
                      const isPending = apply.applyStatus === 0;
                      return (
                        <tr key={apply.id}>
                          <td>
                            <div className="applicant-info">
                              <strong>{apply.applicantName || apply.userAccount}</strong>
                            </div>
                          </td>
                          <td>{apply.applyReason || "无"}</td>
                          <td>{new Date(apply.createTime).toLocaleString("zh-CN")}</td>
                          <td>
                            {apply.applyStatus === 0 ? (
                              <span className="status-pending">待审核</span>
                            ) : apply.applyStatus === 1 ? (
                              <span className="status-approved">已通过</span>
                            ) : (
                              <span className="status-rejected">已拒绝</span>
                            )}
                          </td>
                          <td>
                            {isPending ? (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() => handleReviewApply(apply, true)}
                                >
                                  通过
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() => handleReviewApply(apply, false)}
                                >
                                  拒绝
                                </button>
                              </>
                            ) : (
                              <span className="no-action">已处理</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span className="total-text">
                共 {applyTotal} 条申请记录，第 {applyCurrent}/{Math.ceil(applyTotal / applyPageSize) || 1} 页
              </span>
              <div className="pagination-buttons">
                <button disabled={applyCurrent === 1} onClick={() => { setApplyCurrent(1); fetchApplyList(); }}>首页</button>
                <button disabled={applyCurrent === 1} onClick={() => { setApplyCurrent(applyCurrent - 1); fetchApplyList(); }}>上一页</button>
                <button disabled={applyCurrent >= Math.ceil(applyTotal / applyPageSize)} onClick={() => { setApplyCurrent(applyCurrent + 1); fetchApplyList(); }}>下一页</button>
                <button disabled={applyCurrent >= Math.ceil(applyTotal / applyPageSize)} onClick={() => { setApplyCurrent(Math.ceil(applyTotal / applyPageSize)); fetchApplyList(); }}>末页</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setApplyModalVisible(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {recruitModalVisible && selectedSpace && (
        <div className="modal-overlay" onClick={() => setRecruitModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>发布招募到广场 - {selectedSpace.spaceName}</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>空间名称</label>
                <input
                  type="text"
                  value={selectedSpace.spaceName}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>招募标题 <span className="required">*</span></label>
                <input
                  type="text"
                  value={recruitData.title}
                  onChange={(e) => setRecruitData({ ...recruitData, title: e.target.value })}
                  placeholder="例如：寻找摄影师加入我们的创作空间"
                  className="form-input"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>招募介绍</label>
                <textarea
                  value={recruitData.content}
                  onChange={(e) => setRecruitData({ ...recruitData, content: e.target.value })}
                  placeholder="描述你的空间，招募什么样的成员，以及加入后可以获得什么..."
                  rows={4}
                  className="form-textarea"
                  maxLength={500}
                />
              </div>
              <div className="form-group">
                <label>招募人数上限</label>
                <input
                  type="number"
                  value={recruitData.maxApplyCount}
                  onChange={(e) => setRecruitData({ ...recruitData, maxApplyCount: parseInt(e.target.value) || 5 })}
                  min={1}
                  max={100}
                  className="form-input"
                />
                <p className="form-hint">最多接受多少人申请加入</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setRecruitModalVisible(false)}>取消</button>
              <button className="publish-recruit-btn" onClick={handlePublishRecruit}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                发布到广场
              </button>
            </div>
          </div>
        </div>
      )}

      {createSpaceModalVisible && (
        <div className="modal-overlay" onClick={() => setCreateSpaceModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>创建新空间</h2>
            <div className="modal-body">
              <div className="form-group">
                <label>空间名称 <span className="required">*</span></label>
                <input
                  type="text"
                  value={newSpaceData.spaceName}
                  onChange={(e) => setNewSpaceData({ ...newSpaceData, spaceName: e.target.value })}
                  placeholder="例如：我的摄影作品集"
                  className="form-input"
                  maxLength={50}
                />
                <p className="form-hint">给您的空间起一个简洁明了的名称</p>
              </div>
              <div className="form-group">
                <label>空间等级</label>
                <select
                  value={newSpaceData.spaceLevel}
                  onChange={(e) => setNewSpaceData({ ...newSpaceData, spaceLevel: parseInt(e.target.value) })}
                  className="form-input"
                >
                  <option value={0}>普通版 (免费)</option>
                  <option value={1}>专业版</option>
                  <option value={2}>旗舰版</option>
                </select>
                <p className="form-hint">不同等级具有不同的存储容量和功能限制</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => {
                setCreateSpaceModalVisible(false);
                setNewSpaceData({ spaceName: "", spaceLevel: 0 });
              }}>取消</button>
              <button className="confirm-btn" onClick={handleCreateSpace}>确认创建</button>
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
