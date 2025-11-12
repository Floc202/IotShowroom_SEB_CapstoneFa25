import { Outlet, useNavigate } from "react-router-dom";
import { Dropdown, Avatar } from "antd";
import { useAuth } from "../providers/AuthProvider";
import { Github, Mail } from "lucide-react";
import { roleRedirectMap } from "../utils/helpers";
import logo from "../assets/logo.png";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.roleName) {
      const dashboardPath = roleRedirectMap[user.roleName];
      navigate(dashboardPath);
    } else {
      navigate("/dashboard"); 
    }
  };

  const items = [
    {
      key: "dashboard",
      label: <span onClick={handleDashboardClick}>Dashboard</span>,
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

  const onLogin = () => navigate("/login");
  const onGetStarted = () => navigate("/register");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={logo}
                alt="IoT Showroom Logo"
                className="w-24 h-24 object-contain"
              />
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#projects"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Projects
              </a>
              <a
                href="#demo"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Live Demo
              </a>
              <a
                href="#docs"
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                Docs
              </a>
            </div>

            {!user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onLogin}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <div
                  onClick={onGetStarted}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                >
                  Get Started
                </div>
              </div>
            ) : (
              <Dropdown menu={{ items }} trigger={["click"]}>
                <button className="flex items-center gap-2">
                  <Avatar src={user.avatarUrl || undefined}>
                    {user.fullName?.[0]}
                  </Avatar>
                  <span className="font-medium">{user.fullName}</span>
                </button>
              </Dropdown>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-[72px]">
        <Outlet />
      </div>

      <footer className="bg-gray-900 text-gray-300 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logo}
                  alt="IoT Showroom Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl font-bold text-white">
                  IoT Showroom
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                The comprehensive platform for IoT project management in
                academic settings.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#projects"
                    className="hover:text-white transition-colors"
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a
                    href="#demo"
                    className="hover:text-white transition-colors"
                  >
                    Live Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">University</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About FPTU
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 IoT Showroom — FPTU Academic Use
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
