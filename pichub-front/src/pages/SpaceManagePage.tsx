import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listSpaceVoByPageUsingPost,
  addSpaceUsingPost,
  updateSpaceUsingPost,
  deleteSpaceUsingPost,
} from "@/api/spaceController";
import {
  listSpaceUserVoByPageUsingPost,
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
} from "@/api/spaceUserController";
import { userLogoutUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./SpaceManagePage.css";

interface SpaceVO {
  id?: number;
  spaceName?: string;
  spaceLevel?: number;
  maxSize?: number;
  maxCount?: number;
  totalSize?: number;
  totalCount?: number;
  createTime?: string;
  updateTime?: string;
}

interface SpaceUserVO {
  id?: number;
  spaceId?: number;
  userId?: number;
  spaceRole?: string;
  userAccount?: string;
  userName?: string;
  createTime?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function SpaceManagePage() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
  const [spaces, setSpaces] = useState<SpaceVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("spaceManage");
  const [editingSpace, setEditingSpace] = useState<SpaceVO | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [spaceData, setSpaceData] = useState({
    spaceName: "",
    spaceLevel: 0,
    maxSize: 1048576001000
  });

  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceVO | null>(null);
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
    }
  };

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await listSpaceVoByPageUsingPost({
        current,
        pageSize,
      });
      if (typeof res === 'object' && res !== null && 'code' in res && res.code === 0) {
        const responseData = res.data as any;
        if (responseData?.records) {
          setSpaces(responseData.records);
          setTotal(responseData.total || 0);
        }
      }
    } catch (error) {
      console.error("获取空间列表失败", error);
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
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [current, pageSize]);

  useEffect(() => {
    if (memberModalVisible && selectedSpace) {
      fetchSpaceUsers();
    }
  }, [memberModalVisible, memberCurrent, memberPageSize, selectedSpace]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该空间吗？")) return;
    try {
      const res = await deleteSpaceUsingPost({ id });
      if (res.code === 0) {
        showMessage("删除成功");
        fetchSpaces();
      } else {
        showMessage(res.message || "删除失败", "error");
      }
    } catch (error) {
      console.error("删除空间失败", error);
      showMessage("删除失败", "error");
    }
  };

  const handleEdit = (space: SpaceVO) => {
    setEditingSpace({ ...space });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editingSpace || !editingSpace.id) return;
    try {
      const res = await updateSpaceUsingPost({
        id: editingSpace.id,
        spaceName: editingSpace.spaceName,
        spaceLevel: editingSpace.spaceLevel,
        maxSize: editingSpace.maxSize,
        maxCount: editingSpace.maxCount,
      });

      if (res.code === 0) {
        showMessage("修改成功");
        setEditModalVisible(false);
        fetchSpaces();
      } else {
        showMessage(res.message || "修改失败", "error");
      }
    } catch (error) {
      console.error("修改空间失败", error);
      showMessage("修改失败", "error");
    }
  };

  const handleAddSubmit = async () => {
    if (!spaceData.spaceName) {
      showMessage("请输入空间名称", "error");
      return;
    }
    try {
      const res = await addSpaceUsingPost({
        spaceName: spaceData.spaceName,
        spaceLevel: spaceData.spaceLevel,
        maxSize: spaceData.maxSize,
        maxCount: 1000,
      });

      if (res.code === 0) {
        showMessage("添加成功");
        setAddModalVisible(false);
        setSpaceData({ spaceName: "", spaceLevel: 0, maxSize: 1048576001000 });
        fetchSpaces();
      } else {
        showMessage(res.message || "添加失败", "error");
      }
    } catch (error) {
      console.error("添加空间失败", error);
      showMessage("添加失败", "error");
    }
  };

  const handleViewMembers = (space: SpaceVO) => {
    setSelectedSpace(space);
    setMemberCurrent(1);
    setMemberModalVisible(true);
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

  const getSpaceLevelText = (level?: number) => {
    switch (level) {
      case 0: return "基础版";
      case 1: return "专业版";
      case 2: return "高级版";
      default: return "未知";
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
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const totalPages = Math.ceil(total / pageSize);
  const memberTotalPages = Math.ceil(memberTotal / memberPageSize);

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
            <h1>空间管理</h1>
          </div>
          <div className="header-right">
            <button className="upload-btn" onClick={() => setAddModalVisible(true)}>
              添加空间
            </button>
            <button onClick={handleBackToUser} className="back-btn">
              返回用户端
            </button>
            <button onClick={handleLogout} className="logout-btn">
              退出登录
            </button>
          </div>
        </header>

        <div className="table-container">
          <table className="space-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>空间名称</th>
                <th>空间等级</th>
                <th>容量使用</th>
                <th>数量使用</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loading-cell">加载中...</td>
                </tr>
              ) : spaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">暂无空间</td>
                </tr>
              ) : (
                spaces.map((space) => (
                  <tr key={space.id}>
                    <td>{space.id}</td>
                    <td>{space.spaceName}</td>
                    <td>
                      <span className="space-level-badge">{getSpaceLevelText(space.spaceLevel)}</span>
                    </td>
                    <td>
                      <div className="size-info">
                        <div className="size-bar">
                          <div
                            className="size-fill"
                            style={{ width: `${space.maxSize ? (space.totalSize || 0) / space.maxSize * 100 : 0}%` }}
                          />
                        </div>
                        <span className="size-text">{formatSize(space.totalSize)}/{formatSize(space.maxSize)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="count-text">{space.totalCount || 0}/{space.maxCount || 0}</span>
                    </td>
                    <td>{space.createTime}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" onClick={() => handleViewMembers(space)}>查看成员</button>
                        <button className="edit-btn" onClick={() => handleEdit(space)}>修改</button>
                        <button className="delete-btn" onClick={() => space.id && handleDelete(space.id)}>删除</button>
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

        {editModalVisible && editingSpace && (
          <div className="modal-overlay" onClick={() => setEditModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>修改空间</h2>
              <div className="form-group">
                <label>空间名称</label>
                <input
                  type="text"
                  value={editingSpace.spaceName || ""}
                  onChange={(e) => setEditingSpace({ ...editingSpace, spaceName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>空间等级</label>
                <select
                  value={editingSpace.spaceLevel || 0}
                  onChange={(e) => setEditingSpace({ ...editingSpace, spaceLevel: Number(e.target.value) })}
                >
                  <option value={0}>基础版</option>
                  <option value={1}>专业版</option>
                  <option value={2}>高级版</option>
                </select>
              </div>
              <div className="form-group">
                <label>最大容量 (Bytes)</label>
                <input
                  type="number"
                  value={editingSpace.maxSize || 0}
                  onChange={(e) => setEditingSpace({ ...editingSpace, maxSize: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>最大数量</label>
                <input
                  type="number"
                  value={editingSpace.maxCount || 0}
                  onChange={(e) => setEditingSpace({ ...editingSpace, maxCount: Number(e.target.value) })}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setEditModalVisible(false)}>取消</button>
                <button className="submit-btn" onClick={handleEditSubmit}>提交</button>
              </div>
            </div>
          </div>
        )}

        {addModalVisible && (
          <div className="modal-overlay" onClick={() => setAddModalVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>添加空间</h2>
              <div className="form-group">
                <label>空间名称 *</label>
                <input
                  type="text"
                  value={spaceData.spaceName}
                  onChange={(e) => setSpaceData({ ...spaceData, spaceName: e.target.value })}
                  placeholder="请输入空间名称"
                />
              </div>
              <div className="form-group">
                <label>空间等级</label>
                <select
                  value={spaceData.spaceLevel}
                  onChange={(e) => setSpaceData({ ...spaceData, spaceLevel: Number(e.target.value) })}
                >
                  <option value={0}>基础版</option>
                  <option value={1}>专业版</option>
                  <option value={2}>高级版</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setAddModalVisible(false)}>取消</button>
                <button className="submit-btn" onClick={handleAddSubmit}>提交</button>
              </div>
            </div>
          </div>
        )}

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
                      <th>成员ID</th>
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
                        <td colSpan={6} className="loading-cell">加载中...</td>
                      </tr>
                    ) : spaceUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-cell">暂无成员</td>
                      </tr>
                    ) : (
                      spaceUsers.map((member) => (
                        <tr key={member.id}>
                          <td>{member.id}</td>
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
      </main>
    </div>
  );
}
