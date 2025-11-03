import React, { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { useAuth } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const res = await login(values.email, values.password);
    setSubmitting(false);
    if (!res.ok) return message.error(res.message || "Login failed");
    message.success("Login successful");
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Sign in" className="shadow">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
