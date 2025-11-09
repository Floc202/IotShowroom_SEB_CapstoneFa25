// src/pages/account/Profile.tsx
import React, { useMemo, useState } from "react";
import {
  Avatar,
  Card,
  Tag,
  Button,
  Divider,
  Descriptions,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Upload,
} from "antd";
import {
  Mail,
  Phone,
  User2,
  ShieldCheck,
  Pencil,
  BadgeCheck,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import type { UpdateUserRequest } from "../../types/users";
import { updateUser } from "../../api/users";
import { uploadCloudinary } from "../../api/upload";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

const ROLE_COLOR: Record<string, string> = {
  Admin: "magenta",
  Instructor: "geekblue",
  Student: "green",
};

type FormVals = {
  fullName?: string;
  phone?: string;
  newPassword?: string;
  avatarFile?: File | null;
};

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormVals>();

  if (!user)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full shadow-lg">
          <div className="text-center space-y-2">
            <User2 className="mx-auto w-10 h-10 text-gray-400" />
            <h2 className="text-xl font-semibold">Bạn chưa đăng nhập</h2>
            <p className="text-gray-500">
              Vui lòng đăng nhập để xem hồ sơ của bạn.
            </p>
          </div>
        </Card>
      </div>
    );

  const roleColor = ROLE_COLOR[user.roleName] || "blue";

  const initialVals = useMemo<FormVals>(
    () => ({
      fullName: user.fullName || "",
      phone: user.phone || "",
      newPassword: "",
      avatarFile: null,
    }),
    [user]
  );

  const openEdit = () => {
    form.setFieldsValue(initialVals);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields();
      setSubmitting(true);

      let avatarUrl: string | undefined;
      const file: File | null | undefined = vals.avatarFile as any;

      if (file) {
        const up = await uploadCloudinary(file, "avatar");
        if (!up.isSuccess) {
          toast.error(up.message || "Upload avatar thất bại");
          setSubmitting(false);
          return;
        }
        avatarUrl = up.data.secureUrl || up.data.url;
      }

      const payload: UpdateUserRequest = {
        fullName: vals.fullName?.trim() || undefined,
        phone: vals.phone?.trim() || undefined,
        newPassword: vals.newPassword ? vals.newPassword : undefined,
        avatarUrl, // chỉ gửi nếu có file mới
      };

      const res = await updateUser(user.userId, payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Cập nhật thất bại");
        setSubmitting(false);
        return;
      }

      await refreshMe();
      toast.success("Cập nhật hồ sơ thành công");
      setOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh]">
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <Card
          className="mt-16 mx-4 md:mx-8 shadow-xl rounded-2xl"
          bodyStyle={{ paddingTop: 24 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <Avatar
              size={112}
              src={user.avatarUrl || undefined}
              className="ring-4 ring-white shadow-md"
            >
              {user.fullName?.[0]}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {user.fullName}
                    </h1>
                    <BadgeCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Tag color={roleColor} className="px-3 py-1 text-sm">
                      <div className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{user.roleName}</span>
                      </div>
                    </Tag>
                    <Tag className="px-3 py-1 text-sm" color="default">
                      ID: {user.userId ?? "—"}
                    </Tag>
                  </div>
                </div>

                <Space wrap>
                  <Button
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={openEdit}
                  >
                    Chỉnh sửa
                  </Button>
                </Space>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-10">
            <div>
              <Typography.Title level={4} className="!mb-4">
                Thông tin liên hệ
              </Typography.Title>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100">
                    <Mail className="w-4.5 h-4.5 text-gray-600" />
                  </span>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{user.email || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100">
                    <Phone className="w-4.5 h-4.5 text-gray-600" />
                  </span>
                  <div>
                    <div className="text-xs text-gray-500">Điện thoại</div>
                    <div className="font-medium">{user.phone || "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Typography.Title level={4} className="!mb-4">
                Tài khoản & Quyền
              </Typography.Title>
              <Descriptions
                column={1}
                size="middle"
                bordered
                items={[
                  {
                    key: "username",
                    label: "Tên hiển thị",
                    children: user.fullName || "—",
                  },
                  { key: "role", label: "Vai trò", children: user.roleName },
                  {
                    key: "status",
                    label: "Trạng thái",
                    children: <Tag color="success">Hoạt động</Tag>,
                  },
                  {
                    key: "createdAt",
                    label: "Tham gia",
                    children: user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "—",
                  },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        title={
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            <span>Cập nhật hồ sơ</span>
          </div>
        }
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        destroyOnClose
      >
        <Form<FormVals> form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item name="phone" label="Điện thoại">
            <Input placeholder="0123456789" />
          </Form.Item>

          {/* <Form.Item name="newPassword" label="Mật khẩu mới">
            <Input.Password placeholder="••••••••" />
          </Form.Item> */}

          <Form.Item
            label="Ảnh đại diện"
            name="avatarFile"
            valuePropName="file"
          >
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              listType="picture-card"
              onChange={(info) => {
                const f = info.fileList?.[0]?.originFileObj as File | undefined;
                form.setFieldValue("avatarFile", f || null);
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
