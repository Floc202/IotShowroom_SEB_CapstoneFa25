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
  Shield,
  GraduationCap,
  BookOpenCheck,
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

  const getRoleConfig = () => {
    switch (role) {
      case ROLES.ADMIN:
        return {
          color: "blue",
          gradient: "from-blue-900 to-blue-950",
          icon: Shield,
          bgClass: "bg-blue-50",
          textClass: "text-blue-600",
          borderClass: "border-blue-500",
        };
      case ROLES.INSTRUCTOR:
        return {
          color: "indigo",
          gradient: "from-indigo-900 to-purple-950",
          icon: BookOpenCheck,
          bgClass: "bg-indigo-50",
          textClass: "text-indigo-600",
          borderClass: "border-indigo-500",
        };
      case ROLES.STUDENT:
        return {
          color: "emerald",
          gradient: "from-emerald-900 to-teal-950",
          icon: GraduationCap,
          bgClass: "bg-emerald-50",
          textClass: "text-emerald-600",
          borderClass: "border-emerald-500",
        };
      default:
        return {
          color: "slate",
          gradient: "from-slate-800 to-slate-900",
          icon: UserIcon,
          bgClass: "bg-slate-50",
          textClass: "text-slate-600",
          borderClass: "border-slate-500",
        };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

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
    <Layout className="min-h-screen bg-gray-50">
      <Sider
        width={260}
        className={`!fixed !left-0 !top-0 !h-screen !shadow-2xl !flex !flex-col !bg-gradient-to-br ${roleConfig.gradient} !border-r !border-slate-600/50`}
      >
        <div className="!py-6 !px-4 !border-b !border-white/10">
          <div
            className="flex items-center justify-center mb-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-white rounded-2xl shadow-2xl">
              <img
                src={logo}
                alt="IoT Showroom Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl py-3 px-4 border border-white/20">
            <div className="flex items-center justify-center gap-2.5 text-white">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <RoleIcon className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-wide">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
              </span>
            </div>
          </div>
        </div>

        <nav className="!flex-1 !overflow-y-auto !py-6 !px-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <ul className="space-y-1.5">
            {items.map((it) => {
              const Icon = it.icon;

              const active =
                loc.pathname === it.id || loc.pathname.startsWith(it.id + "/");

              return (
                <li key={it.id}>
                  <div
                    onClick={() => navigate(it.id)}
                    className={`group !relative !w-full !flex !items-center !gap-3.5 !px-4 !py-3 !rounded-xl !text-[15px] !font-semibold !transition-all !duration-300 !cursor-pointer !overflow-hidden ${
                      active
                        ? "!bg-white !text-slate-800 !shadow-2xl !shadow-black/20 !scale-105"
                        : "!text-white/80 hover:!bg-white/15 hover:!text-white hover:!shadow-lg hover:!shadow-black/10 hover:!scale-[1.02] hover:!translate-x-1"
                    }`}
                  >
                    <div className={`absolute inset-0 !transition-all !duration-500 !bg-gradient-to-r ${
                      active ? "!from-white/20 !to-transparent" : "!from-transparent !to-transparent group-hover:!from-white/10"
                    }`} />
                    <Icon className={`w-5 h-5 flex-shrink-0 !transition-transform !duration-300 ${
                      active ? "" : "group-hover:!rotate-12 group-hover:!scale-110"
                    }`} strokeWidth={2.5} />
                    <span className="flex-1">{it.label}</span>
                    {it.showBadge && unreadCount > 0 && (
                      <Badge
                        count={unreadCount}
                        className="shadow-md"
                        style={{ backgroundColor: "#ef4444" }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="!p-3 !border-t !border-white/10">
          <div
            onClick={logout}
            className="!w-full !flex !items-center !gap-3.5 !px-4 !py-3 !rounded-xl !text-white/80 hover:!bg-red-500/20 hover:!text-white !transition-all !duration-300 !cursor-pointer !font-semibold !border !border-white/10 hover:!border-red-400/30"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            <span>Logout</span>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 260 }}>
        <Header
          className={`!sticky !top-0 !z-40 !flex !items-center !justify-between !px-6 !border-b !shadow-md !bg-white`}
        >
          <div
            className={`!flex !items-center !gap-3 !px-4 !py-2 !rounded-lg ${roleConfig.bgClass}`}
          >
            <RoleIcon className={`w-6 h-6 ${roleConfig.textClass}`} />
            <span className={`text-base font-bold ${roleConfig.textClass}`}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
            </span>
          </div>
          <Dropdown menu={{ items: menu }} trigger={["click"]}>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200">
              <div className="text-right !leading-[0]">
                <p className="text-base font-semibold !mb-0">{user?.fullName}</p>
                <p className="text-sm text-gray-500 !mb-0">{user?.email}</p>
              </div>
              <Avatar
                size={44}
                src={user?.avatarUrl || undefined}
                className={`border-2 ${roleConfig.borderClass} shadow-md`}
              >
                {user?.fullName?.[0]}
              </Avatar>
            </div>
          </Dropdown>
        </Header>

        <Content className="!bg-gray-50">
          <Outlet />
        </Content>
      </Layout>

      {role === ROLES.STUDENT && <FloatingChatBubble />}
    </Layout>
  );
}
