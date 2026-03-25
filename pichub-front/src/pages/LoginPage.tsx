import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userLoginUsingPost } from "@/api/userController";
import { useUser } from "@/contexts/UserContext";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setLoginUser, loginUser } = useUser();
  const [userAccount, setUserAccount] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (loginUser) {
    if (loginUser.userRole === "admin") {
      navigate("/user-manage", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAccount || !userPassword) {
      setError("请输入用户名和密码");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await userLoginUsingPost({ userAccount, userPassword });
      if (res.code === 0) {
        setLoginUser(res.data);
        if (res.data?.userRole === "admin") {
          navigate("/user-manage");
        } else {
          navigate("/home");
        }
      } else {
        setError(res.message || "登录失败");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
      
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <h1>PicHub</h1>
          <p>图片管理平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input
              type="text"
              value={userAccount}
              onChange={(e) => setUserAccount(e.target.value)}
              placeholder="请输入用户名"
            />
          </div>
          
          <div className="input-group">
            <div className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                登 录
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>还没有账号？</span>
          <Link to="/register" className="register-link">立即注册</Link>
        </div>
      </div>
    </div>
  );
}
