import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import UserManagePage from "@/pages/UserManagePage";
import AdminDashboard from "@/pages/AdminDashboard";
import PictureManagePage from "@/pages/PictureManagePage";
import PictureReviewPage from "@/pages/PictureReviewPage";
import SpaceManagePage from "@/pages/SpaceManagePage";
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
    path: "/admin",
    element: (
      <AuthGuard requireAdmin>
        <AdminDashboard />
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
    path: "/manage/picture",
    element: (
      <AuthGuard requireAdmin>
        <PictureManagePage />
      </AuthGuard>
    ),
  },
  {
    path: "/manage/picture-review",
    element: (
      <AuthGuard requireAdmin>
        <PictureReviewPage />
      </AuthGuard>
    ),
  },
  {
    path: "/manage/space",
    element: (
      <AuthGuard requireAdmin>
        <SpaceManagePage />
      </AuthGuard>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
