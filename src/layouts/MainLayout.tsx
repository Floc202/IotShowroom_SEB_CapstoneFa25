import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Dropdown, Avatar } from "antd";
import { useAuth } from "../providers/AuthProvider";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    {
      key: "profile",
      label: <span onClick={() => navigate("/profile")}>Hồ sơ</span>,
    },
    {
      key: "logout",
      label: (
        <span className="text-red-500" onClick={logout}>
          Đăng xuất
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">
            IoT Showroom
          </Link>
          <nav className="flex gap-4 items-center">
            {!user ? (
              <>
                <Link to="/login" className="text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="text-blue-600">
                  Register
                </Link>
              </>
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
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} IoT Showroom
        </div>
      </footer>
    </div>
  );
}
