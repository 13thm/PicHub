import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ReactNode, useEffect, useState } from "react";
import { getLoginUserUsingGet } from "@/api/userController";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { loginUser, loading, setLoginUser } = useUser();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 如果本地没有用户信息，直接跳转登录
      if (!loginUser) {
        return;
      }

      setIsChecking(true);
      // 尝试从后端验证登录状态
      try {
        const res = await getLoginUserUsingGet();
        if (typeof res === 'object' && res !== null && 'code' in res) {
          if (res.code !== 0) {
            // 登录无效，清除本地信息
            setLoginUser(null);
          }
        }
      } catch (error) {
        // 后端重启或网络错误，清除本地信息
        console.error("认证检查失败", error);
        setLoginUser(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [setLoginUser, loginUser]);

  if (loading || isChecking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)"
      }}>
        加载中...
      </div>
    );
  }

  if (!loginUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && loginUser.userRole !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
