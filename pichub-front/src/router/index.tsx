import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import UserManagePage from "@/pages/UserManagePage";
import AuthGuard from "@/components/AuthGuard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/home",
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
  },
  {
    path: "/user-manage",
    element: (
      <AuthGuard requireAdmin>
        <UserManagePage />
      </AuthGuard>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
