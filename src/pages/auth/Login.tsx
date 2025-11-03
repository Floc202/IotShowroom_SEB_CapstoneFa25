// src/pages/auth/Login.tsx
import React, { useState } from "react";
import { Button, Card, Form, Input, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../providers/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const res = await login(values.email, values.password);
      if (!res.ok) return toast.error(res.message || "Login failed");
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = (info: any) => {
    const first = info?.errorFields?.[0]?.errors?.[0];
    if (first) toast.error(first);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card
        title={<div className="text-lg font-semibold">Đăng nhập</div>}
        className="shadow"
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          disabled={submitting}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Email is not valid!" },
            ]}
          >
            <Input placeholder="user@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <div className="flex items-center justify-between mb-3">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember?</Checkbox>
            </Form.Item>
            <Link to="#" className="text-sm text-blue-600">
              Forgot password?
            </Link>
          </div>

          <Button type="primary" htmlType="submit" loading={submitting} block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
