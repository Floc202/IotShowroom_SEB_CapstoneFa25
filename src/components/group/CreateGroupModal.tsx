import { Modal, Form, Input } from "antd";

export default function CreateGroupModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string, description?: string) => Promise<void> | void;
}) {
  const [form] = Form.useForm<{ groupName: string; description?: string }>();
  const handleOk = async () => {
    const v = await form.validateFields();
    await onCreate(v.groupName, v.description);
    form.resetFields();
  };
  return (
    <Modal
      open={open}
      title="Create Group"
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="groupName"
          label="Group Name"
          rules={[{ required: true, message: "Please enter group name" }]}
        >
          <Input placeholder="My Team" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Short description (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
