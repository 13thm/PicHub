import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listAdminPictureVoByPageUsingPost,
  reviewPictureUsingPost
} from "@/api/pictureController";
import { userLogoutUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./PictureReviewPage.css";

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
  reviewMessage?: string;
  userId?: number;
  createTime?: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function PictureReviewPage() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
  const [pictures, setPictures] = useState<PictureVO[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("pictureReview");
  const [selectedPicture, setSelectedPicture] = useState<PictureVO | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewStatus, setReviewStatus] = useState<number>(1);
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
    }
  };

  const fetchPictures = async () => {
    setLoading(true);
    try {
      const res = await listAdminPictureVoByPageUsingPost({
        current,
        pageSize,
        searchField: searchText || undefined,
        category: category || undefined,
        reviewStatus: 0,
      });
      // @ts-ignore
      if (res.code === 0 && res.data?.records) {
        // @ts-ignore
        setPictures(res.data.records);
        // @ts-ignore
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error("获取待审核图片列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, [current, pageSize, searchText, category]);

  const handleSearch = () => {
    setCurrent(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrent(1);
  };

  const handleReview = (picture: PictureVO) => {
    setSelectedPicture(picture);
    setReviewMessage("");
    setReviewStatus(1);
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedPicture || !selectedPicture.id) return;
    try {
      const res = await reviewPictureUsingPost({
        id: selectedPicture.id,
        reviewStatus,
        reviewMessage: reviewMessage || undefined,
      });
      // @ts-ignore
      if (res.code === 0) {
        showMessage(reviewStatus === 1 ? "审核通过" : "审核已拒绝");
        setReviewModalVisible(false);
        setSelectedPicture(null);
        fetchPictures();
      } else {
        // @ts-ignore
        showMessage(res.message || "审核失败", "error");
      }
    } catch (error) {
      console.error("审核失败", error);
      showMessage("审核失败", "error");
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

  const getReviewStatusText = (status: number) => {
    switch (status) {
      case 0: return "待审核";
      case 1: return "已通过";
      case 2: return "已拒绝";
      default: return "未知";
    }
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
            <h1>图片审核</h1>
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
            placeholder="搜索待审核图片..."
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
          <button onClick={handleSearch} className="search-btn">
            搜索
          </button>
        </div>

        <div className="table-container">
          <table className="picture-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>缩略图</th>
                <th>图片名称</th>
                <th>分类</th>
                <th>标签</th>
                <th>审核状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loading-cell">加载中...</td>
                </tr>
              ) : pictures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">暂无待审核图片</td>
                </tr>
              ) : (
                pictures.map((picture) => (
                  <tr key={picture.id}>
                    <td>{picture.id}</td>
                    <td>
                      <img
                        src={picture.thumbnailUrl || picture.url}
                        alt={picture.name}
                        className="table-thumbnail"
                      />
                    </td>
                    <td>{picture.name}</td>
                    <td>
                      <span className="category-badge">{picture.category || "未分类"}</span>
                    </td>
                    <td>
                      <div className="tags-cell">
                        {picture.tags?.split(",").slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag-badge">{tag.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="review-badge pending">
                        {getReviewStatusText(picture.reviewStatus || 0)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="review-btn" onClick={() => handleReview(picture)}>审核</button>
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
            共 {total} 条待审核记录，第 {current}/{totalPages || 1} 页
          </span>
          <div className="pagination-buttons">
            <button disabled={current === 1} onClick={() => setCurrent(1)}>首页</button>
            <button disabled={current === 1} onClick={() => setCurrent(current - 1)}>上一页</button>
            <button disabled={current >= totalPages} onClick={() => setCurrent(current + 1)}>下一页</button>
            <button disabled={current >= totalPages} onClick={() => setCurrent(totalPages)}>末页</button>
          </div>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={12}>12条/页</option>
            <option value={24}>24条/页</option>
            <option value={48}>48条/页</option>
          </select>
        </div>

        {reviewModalVisible && selectedPicture && (
          <div className="review-modal-overlay" onClick={() => setReviewModalVisible(false)}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>审核图片</h2>
              <div className="review-picture">
                <img src={selectedPicture.url || selectedPicture.thumbnailUrl} alt={selectedPicture.name} />
              </div>
              <div className="review-info">
                <p><strong>图片名称：</strong>{selectedPicture.name}</p>
                <p><strong>分类：</strong>{selectedPicture.category || "未分类"}</p>
                <p><strong>标签：</strong>{selectedPicture.tags || "无"}</p>
                <p><strong>简介：</strong>{selectedPicture.introduction || "暂无"}</p>
              </div>
              <div className="review-form">
                <label>审核结果</label>
                <div className="review-options">
                  <label className="review-option">
                    <input
                      type="radio"
                      name="reviewStatus"
                      value={1}
                      checked={reviewStatus === 1}
                      onChange={() => setReviewStatus(1)}
                    />
                    <span className="approve">通过</span>
                  </label>
                  <label className="review-option">
                    <input
                      type="radio"
                      name="reviewStatus"
                      value={2}
                      checked={reviewStatus === 2}
                      onChange={() => setReviewStatus(2)}
                    />
                    <span className="reject">拒绝</span>
                  </label>
                </div>
                <label>审核原因</label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="请输入审核原因（可选）"
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setReviewModalVisible(false)}>取消</button>
                <button className="submit-btn" onClick={handleReviewSubmit}>提交审核</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
