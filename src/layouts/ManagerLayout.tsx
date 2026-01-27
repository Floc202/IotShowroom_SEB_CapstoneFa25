import { useMemo, useState, useEffect } from "react";
import { Layout, Avatar, Dropdown, Badge } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  Home,
  Users,
  BookOpen,
  Trophy,
  MessageSquare,
  BarChart3,
  Bell,
  User as UserIcon,
  LogOut,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { ROLES } from "../utils/constants";
import logo from "../assets/logo.png";
import { useNotificationHub } from "../hooks/useNotificationHub";
import toast from "react-hot-toast";
import { getNotificationSummary } from "../api/notification";
import { FloatingChatBubble } from "../components/chat/FloatingChatBubble";

const { Sider, Header, Content } = Layout;

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const role = (user?.roleName || "").toString();
  const loc = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificationSummary = async () => {
    try {
      const res = await getNotificationSummary();
      if (res.isSuccess && res.data) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to fetch notification summary:", e);
    }
  };

  useEffect(() => {
    fetchNotificationSummary();
  }, []);

  useNotificationHub({
    onNotification: (notification) => {
      toast.success(`${notification.title}: ${notification.message}`, {
        duration: 5,
      });
      fetchNotificationSummary();
    },
  });

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
        {
          id: "/admin/semesters",
          icon: Calendar,
          label: "Semester Management",
        },
        { id: "/admin/classes", icon: BookOpen, label: "Classes" },
        { id: "/admin/hall-of-fame", icon: Trophy, label: "Hall of Fame" },
        // {
        //   id: "/notifications",
        //   icon: MessageSquare,
        //   label: "Notifications",
        //   showBadge: true,
        // },
        { id: "/admin/reports", icon: BarChart3, label: "Reports" },
      ];
    if (role === ROLES.INSTRUCTOR)
      return [
        { id: "/instructor/dashboard", icon: Home, label: "Dashboard" },
        { id: "/instructor/classes", icon: BookOpen, label: "Classes" },
        { id: "/instructor/grading", icon: ClipboardCheck, label: "Grading" },
        {
          id: "/notifications",
          icon: MessageSquare,
          label: "Notifications",
          showBadge: true,
        },
        { id: "/instructor/hall-of-fame", icon: Trophy, label: "Hall of Fame" },
        { id: "/profile", icon: UserIcon, label: "Profile" },
      ];
    if (role === ROLES.STUDENT)
      return [
        { id: "/student/dashboard", icon: Home, label: "Dashboard" },
        { id: "/student/classes", icon: BookOpen, label: "My Classes" },
        {
          id: "/notifications",
          icon: Bell,
          label: "Notifications",
          showBadge: true,
        },
        { id: "/student/hall-of-fame", icon: Trophy, label: "Hall of Fame" },
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
                    <span className="flex-1">{it.label}</span>
                    {it.showBadge && unreadCount > 0 && (
                      <Badge count={unreadCount} />
                    )}
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

      {role === ROLES.STUDENT && <FloatingChatBubble />}
    </Layout>
  );
}
