// src/pages/auth/Register.tsx
import React, { useState } from "react";
import { Button, Card, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { register as registerApi } from "../../api/auth";

export default function Register() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const res = await registerApi(values);
      if (!res.isSuccess) return toast.error(res.message || "Registration failed");
      toast.success("Registration successful. Please log in!");
      navigate("/login");
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
        title={<div className="text-lg font-semibold">Sign up</div>}
        className="shadow"
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          disabled={submitting}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please enter your fullname" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Email is not valid!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters long" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={submitting} block>
            Đăng ký
          </Button>
        </Form>
      </Card>
    </div>
  );
}
