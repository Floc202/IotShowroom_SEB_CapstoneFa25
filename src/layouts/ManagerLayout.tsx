import React, { useMemo } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Home,
  Users,
  BookOpen,
  Monitor,
  Trophy,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardCheck,
  Target,
  FileCheck,
  FolderOpen,
  Bell,
  User as UserIcon,
  LogOut,
  Calendar,
} from "lucide-react";
import { ROLES } from "../utils/constants";
import logo from "../assets/logo.png";

const { Sider, Header, Content } = Layout;

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const role = (user?.roleName || "").toString();
  const loc = useLocation();
  const navigate = useNavigate();

  const menu = [
    {
      key: "profile",
      label: <span onClick={() => navigate("/profile")}>Profile</span>,
    },
    {
      key: "logout",
      label: (
        <span className="text-red-500" onClick={logout}>
          Logout
        </span>
      ),
    },
  ];

  const items = useMemo(() => {
    if (role === ROLES.ADMIN)
      return [
        { id: "/admin/dashboard", icon: Home, label: "Dashboard" },
        { id: "/admin/users", icon: Users, label: "User Management" },
        { id: "/admin/semesters", icon: Calendar, label: "Semester Management" },
        { id: "/admin/classes", icon: BookOpen, label: "Classes" },
        { id: "/admin/monitoring", icon: Monitor, label: "Project Monitoring" },
        { id: "/admin/hall-of-fame", icon: Trophy, label: "Hall of Fame" },
        {
          id: "/admin/announcements",
          icon: MessageSquare,
          label: "Announcements",
        },
        { id: "/admin/reports", icon: BarChart3, label: "Reports" },
        { id: "/admin/settings", icon: Settings, label: "System Settings" },
      ];
    if (role === ROLES.INSTRUCTOR)
      return [
        { id: "/instructor/dashboard", icon: Home, label: "Dashboard" },
        { id: "/instructor/classes", icon: BookOpen, label: "Classes" },
        { id: "/instructor/groups", icon: Users, label: "Groups" },
        {
          id: "/instructor/proposals",
          icon: ClipboardCheck,
          label: "Proposals",
        },
        { id: "/instructor/milestones", icon: Target, label: "Milestones" },
        { id: "/instructor/grading", icon: FileCheck, label: "Grading" },
        {
          id: "/instructor/announcements",
          icon: MessageSquare,
          label: "Announcements",
        },
        { id: "/profile", icon: UserIcon, label: "Profile" },
      ];
    if (role === ROLES.STUDENT)
      return [
        { id: "/student/dashboard", icon: Home, label: "Dashboard" },
        { id: "/student/classes", icon: BookOpen, label: "My Classes" },
        { id: "/student/projects", icon: FolderOpen, label: "My Projects" },
        { id: "/notifications", icon: Bell, label: "Notifications" },
        { id: "/profile", icon: UserIcon, label: "Profile" },
      ];
    return [{ id: "/", icon: Home, label: "Dashboard" }];
  }, [role]);

  return (
    <Layout className="min-h-screen bg-white">
      <Sider
        width={280}
        className="!bg-white !fixed !left-0 !top-0 !h-screen border-r border-gray-200 shadow-sm flex flex-col"
      >
        <div className="border-b border-gray-200">
          <div
            className="flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="IoT Showroom Logo"
              className="w-24 h-24 object-contain"
            />
            <div className="text-lg font-bold text-gray-900">IoT Showroom</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((it) => {
              const Icon = it.icon;

              const active =
                loc.pathname === it.id || loc.pathname.startsWith(it.id + "/");

              return (
                <li key={it.id}>
                  <div
                    onClick={() => navigate(it.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{it.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 280 }}>
        <Header className="!bg-white sticky top-0 z-40 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="text-sm text-gray-500">
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
          </div>
          <Dropdown menu={{ items: menu }} trigger={["click"]}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{user?.fullName}</span>
              <Avatar src={user?.avatarUrl || undefined}>
                {user?.fullName?.[0]}
              </Avatar>
            </div>
          </Dropdown>
        </Header>

        <Content className="bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
