import React from "react";
import { Layout, Menu, Avatar } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const { Sider, Header, Content } = Layout;

const items = [
  { key: "/admin", label: <Link to="/admin">Dashboard</Link> },
  { key: "/manager", label: <Link to="/manager">Manager</Link> },
];

export default function AdminManagerLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const selectedKeys = items.some((i) => i.key === loc.pathname)
    ? [loc.pathname]
    : [];
  return (
    <Layout className="min-h-screen">
      <Sider width={280} className="!bg-white shadow">
        <div className="p-4 text-xl font-bold">IoT Showroom</div>
        <Menu mode="inline" selectedKeys={selectedKeys} items={items} />
      </Sider>
      <Layout>
        <Header className="!bg-white flex items-center justify-between px-6 border-b">
          <div className="font-medium">{user?.roleName}</div>
          <div className="flex items-center gap-3">
            <span>{user?.fullName}</span>
            <Avatar src={user?.avatarUrl || undefined}>
              {user?.fullName?.[0]}
            </Avatar>
            <button className="text-red-500" onClick={logout}>
              Logout
            </button>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
