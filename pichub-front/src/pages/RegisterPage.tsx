import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userRegisterUsingPost } from "@/api/userController";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userAccount, setUserAccount] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAccount || !userPassword || !checkPassword) {
      setError("请填写所有字段");
      return;
    }
    if (userPassword !== checkPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (userPassword.length < 6) {
      setError("密码长度至少6位");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await userRegisterUsingPost({ userAccount, userPassword, checkPassword });
      if (res.code === 0) {
        alert("注册成功，请登录");
        navigate("/login");
      } else {
        setError(res.message || "注册失败");
      }
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>注册</h1>
          <p>加入 PicHub</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={userAccount}
              onChange={(e) => setUserAccount(e.target.value)}
              placeholder="请输入用户名"
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="请输入密码（至少6位）"
            />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              value={checkPassword}
              onChange={(e) => setCheckPassword(e.target.value)}
              placeholder="请再次输入密码"
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="register-footer">
          <span>已有账号？</span>
          <Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  );
}
