import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { loginUser, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f23",
        color: "#fff"
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
