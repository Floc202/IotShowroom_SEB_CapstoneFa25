import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import ManagerLayout from "./layouts/ManagerLayout";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import HallOfFame from "./pages/admin/HallOfFame";
import AdminReports from "./pages/admin/AdminReports";
import InstructorDashboard from "./pages/dashboards/InstructorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import { ROLES } from "./utils/constants";
import Profile from "./pages/accounts/Profile";
import Unauthorized from "./pages/auth/Unauthorized";
import SemesterManagement from "./pages/admin/SemesterManagement";
import NotFound from "./pages/NotFound";
import ClassDetailPage from "./pages/classes/ClassDetailPage";
import ClassManagement from "./pages/admin/ClassManagement";
import StudentClassManagement from "./pages/student/StudentClassManagement";
import UserManagement from "./pages/admin/UserManagement";
import StudentClassDetail from "./pages/student/StudentClassDetail";
import StudentSimulation from "./pages/student/StudentSimulation";
import InstructorClasses from "./pages/instructor/InstructorClasses";
import InstructorClassDetail from "./pages/instructor/InstructorClassDetail";
import InstructorGroupDetail from "./pages/instructor/InstructorGroupDetail";
import InstructorSimulationView from "./pages/instructor/InstructorSimulationView";
import GradingManagement from "./pages/instructor/GradingManagement";
import InstructorGradingSubmissionView from "./pages/instructor/InstructorGradingSubmissionView";
import Notifications from "./pages/Notifications";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allow={[ROLES.INSTRUCTOR]} />}>
              <Route element={<ManagerLayout />}>
                <Route
                  path="/instructor/dashboard"
                  element={<InstructorDashboard />}
                />
                <Route
                  path="/instructor/classes"
                  element={<InstructorClasses />}
                />
                <Route
                  path="/instructor/classes/:id"
                  element={<InstructorClassDetail />}
                />
                <Route
                  path="/instructor/classes/:classId/groups/:groupId"
                  element={<InstructorGroupDetail />}
                />
                <Route
                  path="/instructor/classes/:classId/groups/:groupId/simulation"
                  element={<InstructorSimulationView />}
                />
                <Route
                  path="/instructor/grading"
                  element={<GradingManagement />}
                />
                <Route
                  path="/instructor/grading/submission"
                  element={<InstructorGradingSubmissionView />}
                />
                <Route path="/instructor/hall-of-fame" element={<HallOfFame />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allow={[ROLES.STUDENT]} />}>
              <Route element={<ManagerLayout />}>
                <Route
                  path="/student/dashboard"
                  element={<StudentDashboard />}
                />
                <Route
                  path="/student/classes"
                  element={<StudentClassManagement />}
                />
                <Route
                  path="/student/classes/:id"
                  element={<StudentClassDetail />}
                />
                <Route
                  path="/student/classes/:id/simulation"
                  element={<StudentSimulation />}
                />
                <Route path="/student/hall-of-fame" element={<HallOfFame />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allow={[ROLES.ADMIN]} />}>
              <Route element={<ManagerLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/hall-of-fame" element={<HallOfFame />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/classes/" element={<ClassManagement />} />
                <Route
                  path="/admin/classes/:id"
                  element={<ClassDetailPage />}
                />
                <Route
                  path="/admin/semesters"
                  element={<SemesterManagement />}
                />
              </Route>
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allow={[ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT]}
                />
              }
            >
              <Route element={<ManagerLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
