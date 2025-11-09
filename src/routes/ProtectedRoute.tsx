import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import type { RoleName } from "../types/auth";
import { roleRedirectMap } from "../utils/helpers";

export default function ProtectedRoute({
  allow,
}: {
  allow: RoleName | RoleName[];
}) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    if (["/login", "/register"].includes(location.pathname)) {
      const target = roleRedirectMap[user.roleName as RoleName] || "/";
      navigate(target, { replace: true });
      return;
    }

    if (!hasRole(allow)) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    setChecked(true);
  }, [user, loading, location.pathname]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!checked) return null;

  return <Outlet />;
}
