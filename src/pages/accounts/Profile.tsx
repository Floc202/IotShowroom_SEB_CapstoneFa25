import React from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <div>Hãy đăng nhập để xem hồ sơ.</div>;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
      <div>
        <b>Họ tên:</b> {user.fullName}
      </div>
      <div>
        <b>Email:</b> {user.email}
      </div>
      <div>
        <b>Điện thoại:</b> {user.phone}
      </div>
      <div>
        <b>Role:</b> {user.roleName}
      </div>
    </div>
  );
}
