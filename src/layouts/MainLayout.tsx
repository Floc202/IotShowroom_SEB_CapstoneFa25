import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">
            IoT Showroom
          </Link>
          <nav className="flex gap-4">
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-blue-600">
              Register
            </Link>
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
