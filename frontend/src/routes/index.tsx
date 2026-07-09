import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProfilePage from "../pages/profile/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
  path: "/dashboard",
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <DashboardPage />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
  ],
},
]);