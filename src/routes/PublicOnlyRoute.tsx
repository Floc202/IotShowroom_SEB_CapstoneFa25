import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import type { RoleName } from "../types/auth";
import { roleRedirectMap } from "../utils/helpers";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      const redirectPath = roleRedirectMap[user.roleName as RoleName] || "/";
      navigate(redirectPath, { replace: true });
      return;
    }

    setChecked(true);
  }, [user, loading]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!checked) return null;

  return <Outlet />;
}
