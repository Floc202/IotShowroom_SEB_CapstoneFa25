import { Modal, Form, InputNumber, Input } from "antd";

interface GroupModalsProps {
  inviteOpen: boolean;
  updateOpen: boolean;
  projectOpen: boolean;
  projectUpdateOpen: boolean;
  actionLoading: boolean;
  inviteForm: any;
  updateForm: any;
  projectForm: any;
  projectUpdateForm: any;
  onInviteCancel: () => void;
  onInviteOk: () => void;
  onUpdateCancel: () => void;
  onUpdateOk: () => void;
  onProjectCreateCancel: () => void;
  onProjectCreateOk: () => void;
  onProjectUpdateCancel: () => void;
  onProjectUpdateOk: () => void;
}

export default function GroupModals({
  inviteOpen,
  updateOpen,
  projectOpen,
  projectUpdateOpen,
  actionLoading,
  inviteForm,
  updateForm,
  projectForm,
  projectUpdateForm,
  onInviteCancel,
  onInviteOk,
  onUpdateCancel,
  onUpdateOk,
  onProjectCreateCancel,
  onProjectCreateOk,
  onProjectUpdateCancel,
  onProjectUpdateOk,
}: GroupModalsProps) {
  return (
    <>
      <Modal
        open={inviteOpen}
        title="Invite Member"
        onCancel={onInviteCancel}
        onOk={onInviteOk}
        confirmLoading={actionLoading}
        okText="Send Invitation"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="invitedUserId"
            label="User ID"
            rules={[{ required: true, message: "Enter user ID to invite" }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              placeholder="Enter user ID"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={updateOpen}
        title="Update Group Information"
        onCancel={onUpdateCancel}
        onOk={onUpdateOk}
        confirmLoading={actionLoading}
        okText="Save Changes"
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Enter group name" }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter group description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={projectOpen}
        title="Create New Project"
        onCancel={onProjectCreateCancel}
        onOk={onProjectCreateOk}
        confirmLoading={actionLoading}
        okText="Create Project"
      >
        <Form form={projectForm} layout="vertical">
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: "Enter project title" }]}
          >
            <Input placeholder="Enter project title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={4}
              placeholder="Enter project description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={projectUpdateOpen}
        title="Update Project Information"
        onCancel={onProjectUpdateCancel}
        onOk={onProjectUpdateOk}
        confirmLoading={actionLoading}
        okText="Save Changes"
      >
        <Form form={projectUpdateForm} layout="vertical">
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: "Enter project title" }]}
          >
            <Input placeholder="Enter project title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={4}
              placeholder="Enter project description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
