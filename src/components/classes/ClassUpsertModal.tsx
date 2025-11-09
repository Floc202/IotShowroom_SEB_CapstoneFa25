// src/components/classes/ClassUpsertModal.tsx
import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { Semester } from "../../types/semesters";
import type { ClassItem, CreateClassRequest, UpdateClassRequest } from "../../types/classes";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateClassRequest | UpdateClassRequest) => void;
  semesters: Semester[];
  instructors: { userId: number; fullName: string; email?: string }[];
  editing?: ClassItem;
};

export default function ClassUpsertModal({
  open,
  onClose,
  onSubmit,
  semesters,
  instructors,
  editing,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          className: editing.className,
          description: editing.description,
          semesterId: editing.semesterId,
          instructorId: editing.instructorId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      const payload: UpdateClassRequest = {
        className: values.className,
        description: values.description,
        instructorId: values.instructorId,
      };
      onSubmit(payload);
    } else {
      const payload: CreateClassRequest = {
        className: values.className,
        description: values.description,
        semesterId: values.semesterId,
        instructorId: values.instructorId,
      };
      onSubmit(payload);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={submit}
      title={editing ? "Edit Class" : "Create Class"}
      okText={editing ? "Save changes" : "Create"}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Class name"
          name="className"
          rules={[{ required: true, message: "Please input class name" }]}
        >
          <Input placeholder="e.g. SE1718_IoT_FA25" />
        </Form.Item>

        {!editing && (
          <Form.Item
            label="Semester"
            name="semesterId"
            rules={[{ required: true, message: "Please select semester" }]}
          >
            <Select
              placeholder="Select semester"
              options={semesters.map((s) => ({ label: s.name || s.code, value: s.semesterId }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Instructor"
          name="instructorId"
          rules={[{ required: true, message: "Please select instructor" }]}
        >
          <Select
            placeholder="Select instructor"
            options={instructors.map((i) => ({
              label: `${i.fullName}${i.email ? ` — ${i.email}` : ""}`,
              value: i.userId,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Optional description…" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
