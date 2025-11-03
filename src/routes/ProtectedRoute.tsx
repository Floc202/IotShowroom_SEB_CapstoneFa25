import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import type { RoleName } from "../types/auth";

export default function ProtectedRoute({
  allow,
}: {
  allow: RoleName | RoleName[];
}) {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return hasRole(allow) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}
