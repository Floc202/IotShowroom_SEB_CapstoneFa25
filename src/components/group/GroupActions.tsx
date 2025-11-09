import React, { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Popconfirm,
} from "antd";
import { UserPlus, UserMinus, LogOut, Pencil, FolderPlus } from "lucide-react";
import {
  inviteToGroup,
  kickMember,
  leaveGroup,
  updateGroup,
} from "../../api/group";
import { createProject } from "../../api/project";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../providers/AuthProvider";

export default function GroupActions({
  classId,
  groupId,
  onChanged,
}: {
  classId: number;
  groupId: number;
  onChanged?: () => void;
}) {
  const { user } = useAuth();
  const requesterId = user?.userId as number | undefined;

  const [inviteOpen, setInviteOpen] = useState(false);
  const [kickOpen, setKickOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const [inviteForm] = Form.useForm<{ invitedUserId: number }>();
  const [kickForm] = Form.useForm<{ targetUserId: number }>();
  const [updateForm] = Form.useForm<{
    groupName: string;
    description?: string;
  }>();
  const [projectForm] = Form.useForm<{ title: string; description?: string }>();

  const [loading, setLoading] = useState(false);

  const doInvite = async () => {
    try {
      const v = await inviteForm.validateFields();
      if (!requesterId) return toast.error("Missing requester");
      setLoading(true);
      const res = await inviteToGroup({
        groupId,
        invitedUserId: v.invitedUserId,
        inviterUserId: requesterId,
      });
      if (!res.isSuccess) return toast.error(res.message || "Invite failed");
      toast.success("Invitation sent");
      setInviteOpen(false);
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doKick = async () => {
    try {
      const v = await kickForm.validateFields();
      if (!requesterId) return toast.error("Missing requester");
      setLoading(true);
      const res = await kickMember({
        groupId,
        targetUserId: v.targetUserId,
        requesterUserId: requesterId,
      });
      if (!res.isSuccess) return toast.error(res.message || "Kick failed");
      toast.success("Member removed");
      setKickOpen(false);
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doLeave = async () => {
    try {
      if (!user?.userId) return toast.error("Missing user");
      setLoading(true);
      const res = await leaveGroup({ groupId, userId: user.userId });
      if (!res.isSuccess) return toast.error(res.message || "Leave failed");
      toast.success("You left the group");
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doUpdate = async () => {
    try {
      const v = await updateForm.validateFields();
      if (!requesterId) return toast.error("Missing requester");
      setLoading(true);
      const res = await updateGroup({
        groupId,
        requesterUserId: requesterId,
        groupName: v.groupName.trim(),
        description: v.description?.trim() || undefined,
      });
      if (!res.isSuccess) return toast.error(res.message || "Update failed");
      toast.success("Group updated");
      setUpdateOpen(false);
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const doCreateProject = async () => {
    try {
      const v = await projectForm.validateFields();
      setLoading(true);
      const res = await createProject({
        groupId,
        title: v.title.trim(),
        description: v.description?.trim() || "",
      });

      toast.success("Project created");
      setProjectOpen(false);
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm" title="Group Actions">
      <Space wrap>
        <Button
          type="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setInviteOpen(true)}
        >
          Invite
        </Button>
        <Button
          danger
          icon={<UserMinus className="w-4 h-4" />}
          onClick={() => setKickOpen(true)}
        >
          Kick
        </Button>
        <Popconfirm
          title="Leave group?"
          okText="Leave"
          okType="danger"
          onConfirm={doLeave}
        >
          <Button icon={<LogOut className="w-4 h-4" />} loading={loading}>
            Leave
          </Button>
        </Popconfirm>
        <Button
          icon={<Pencil className="w-4 h-4" />}
          onClick={() => setUpdateOpen(true)}
        >
          Update Info
        </Button>
        <Button
          icon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setProjectOpen(true)}
        >
          Create Project
        </Button>
      </Space>

      <Modal
        open={inviteOpen}
        title="Invite Member"
        onCancel={() => setInviteOpen(false)}
        onOk={doInvite}
        confirmLoading={loading}
        okText="Send"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="invitedUserId"
            label="User ID"
            rules={[{ required: true, message: "Enter user ID" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={kickOpen}
        title="Kick Member"
        onCancel={() => setKickOpen(false)}
        onOk={doKick}
        confirmLoading={loading}
        okText="Kick"
      >
        <Form form={kickForm} layout="vertical">
          <Form.Item
            name="targetUserId"
            label="User ID"
            rules={[{ required: true, message: "Enter user ID" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={updateOpen}
        title="Update Group"
        onCancel={() => setUpdateOpen(false)}
        onOk={doUpdate}
        confirmLoading={loading}
        okText="Save"
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Enter group name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={projectOpen}
        title="Create Project"
        onCancel={() => setProjectOpen(false)}
        onOk={doCreateProject}
        confirmLoading={loading}
        okText="Create"
      >
        <Form form={projectForm} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter project title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
