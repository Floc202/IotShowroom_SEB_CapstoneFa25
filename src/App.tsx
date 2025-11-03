import React from "react";
import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import AdminManagerLayout from "./layouts/AdminManagerLayout";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import InstructorDashboard from "./pages/dashboards/InstructorDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import { ROLES } from "./utils/constants";
import Profile from "./pages/accounts/Profile";
import Unauthorized from "./pages/auth/Unauthorized";

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Guest / Instructor / Student */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Instructor area */}
              <Route element={<ProtectedRoute allow={[ROLES.INSTRUCTOR]} />}>
                <Route path="/instructor" element={<InstructorDashboard />} />
              </Route>

              {/* Student area */}
              <Route element={<ProtectedRoute allow={[ROLES.STUDENT]} />}>
                <Route path="/student" element={<StudentDashboard />} />
              </Route>
            </Route>

            {/* Admin + Manager share same layout */}
            <Route
              element={<ProtectedRoute allow={[ROLES.ADMIN, ROLES.MANAGER]} />}
            >
              <Route element={<AdminManagerLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/manager" element={<ManagerDashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
