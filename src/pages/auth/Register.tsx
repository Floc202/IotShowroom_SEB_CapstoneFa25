import React, { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { register as registerApi } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const res = await registerApi(values);
      if (!res.isSuccess)
        return message.error(res.message || "Register failed");
      message.success("Register success, please login");
      navigate("/login");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || err?.message || "Register failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Create account" className="shadow">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Full name"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Register
          </Button>
        </Form>
      </Card>
    </div>
  );
}
