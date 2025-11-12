import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  Avatar,
  Divider,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Pencil,
  FolderOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  getClassGroups,
  updateGroupAsInstructor,
  addMemberToGroup,
  removeMemberFromGroup,
  updateMemberRole,
} from "../../api/instructor";
import { getProjectByGroup } from "../../api/project";
import { updateProjectStatus } from "../../api/project";
import type {
  InstructorGroupDetail,
  InstructorGroupMember,
  UpdateGroupRequest,
  AddMemberRequest,
} from "../../types/instructor";
import type {
  ProjectDetail,
  UpdateProjectStatusRequest,
} from "../../types/project";
import InstructorMilestones from "../../components/milestone/InstructorMilestones";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../providers/AuthProvider";

export default function InstructorGroupDetail() {
  const { classId, groupId } = useParams<{ classId: string; groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<InstructorGroupDetail | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [editForm] = Form.useForm<UpdateGroupRequest>();
  const [addMemberForm] = Form.useForm<AddMemberRequest>();
  const [statusForm] = Form.useForm<{ status: string; comment: string }>();

  useEffect(() => {
    if (classId && groupId) {
      const cId = parseInt(classId);
      const gId = parseInt(groupId);
      (async () => {
        try {
          setLoading(true);
          
          const groupData = await getClassGroups(cId);
          const foundGroup = groupData.data?.find((g) => g.groupId === gId);

          if (foundGroup) {
            setGroup(foundGroup);
            const projectRes = await getProjectByGroup(gId);
            setProject(projectRes || null);
          }
        } catch (e) {
          toast.error(getErrorMessage(e));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [classId, groupId]);

  const handleUpdateGroup = async () => {
    if (!groupId || !group) return;
    try {
      const values = await editForm.validateFields();
      const res = await updateGroupAsInstructor(parseInt(groupId), values);

      if (!res.isSuccess) {
        toast.error(res.message || "Update failed");
        return;
      }

      toast.success("Group updated successfully");
      setEditModalOpen(false);
      
      setGroup({
        ...group,
        groupName: values.groupName || group.groupName,
        description: values.description || group.description,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleAddMember = async () => {
    if (!groupId || !group || !classId) return;
    try {
      const values = await addMemberForm.validateFields();
      const res = await addMemberToGroup(parseInt(groupId), values);

      if (!res.isSuccess) {
        toast.error(res.message || "Add member failed");
        return;
      }

      toast.success("Member added successfully");
      setAddMemberModalOpen(false);
      addMemberForm.resetFields();
      
      const cId = parseInt(classId);
      const gId = parseInt(groupId);
      const groupData = await getClassGroups(cId);
      const foundGroup = groupData.data?.find((g) => g.groupId === gId);
      
      if (foundGroup) {
        setGroup(foundGroup);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!groupId || !group) return;
    try {
      const res = await removeMemberFromGroup(parseInt(groupId), userId);

      if (!res.isSuccess) {
        toast.error(res.message || "Remove failed");
        return;
      }

      toast.success("Member removed successfully");
      
      setGroup({
        ...group,
        members: group.members.filter((m) => m.userId !== userId),
        memberCount: group.memberCount - 1,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    if (!groupId || !group) return;
    try {
      const res = await updateMemberRole(parseInt(groupId), userId, {
        roleInGroup: newRole,
      });

      if (!res.isSuccess) {
        toast.error(res.message || "Update role failed");
        return;
      }

      toast.success("Role updated successfully");
      
      setGroup({
        ...group,
        members: group.members.map((m) =>
          m.userId === userId ? { ...m, roleInGroup: newRole } : m
        ),
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateProjectStatus = async () => {
    if (!project || !user?.userId) return;
    try {
      const values = await statusForm.validateFields();
      const payload: UpdateProjectStatusRequest = {
        projectId: project.projectId,
        instructorId: user.userId,
        status: values.status,
        comment: values.comment,
      };

      await updateProjectStatus(payload);

      toast.success("Project status updated successfully");
      setStatusModalOpen(false);
      statusForm.resetFields();
      
      setProject({
        ...project,
        status: values.status,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const memberColumns: ColumnsType<InstructorGroupMember> = [
    {
      title: "Member",
      key: "member",
      render: (_: any, record: InstructorGroupMember) => (
        <div className="flex items-center gap-3">
          <Avatar size={40}>{record.fullName?.[0]}</Avatar>
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "roleInGroup",
      key: "roleInGroup",
      width: 150,
      render: (role: string, record: InstructorGroupMember) => (
        <Select
          value={role}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateRole(record.userId, value)}
          options={[
            { label: "Leader", value: "Leader" },
            { label: "Member", value: "Member" },
          ]}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: InstructorGroupMember) => (
        <Popconfirm
          title="Remove this member?"
          description={`Remove ${record.fullName}?`}
          onConfirm={() => handleRemoveMember(record.userId)}
        >
          <Button danger size="small" icon={<UserMinus className="w-4 h-4" />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "blue";
      case "approved":
        return "green";
      case "revision":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Space className="w-full justify-between">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Space>

      <Card
        loading={loading}
        title={
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">{group?.groupName}</span>
          </div>
        }
        extra={
          <Button
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => {
              if (group) {
                editForm.setFieldsValue({
                  groupName: group.groupName,
                  description: group.description || "",
                });
              }
              setEditModalOpen(true);
            }}
          >
            Edit Group
          </Button>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Class">
            {group?.className}
          </Descriptions.Item>
          <Descriptions.Item label="Leader">
            {group?.leaderName}
          </Descriptions.Item>
          <Descriptions.Item label="Members">
            <Tag color="blue">{group?.memberCount}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Projects">
            <Tag color="purple">{group?.projectCount}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {group?.createdAt
              ? new Date(group.createdAt).toLocaleDateString()
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {group?.description || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        loading={loading}
        title="Group Members"
        extra={
          <Button
            type="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setAddMemberModalOpen(true)}
          >
            Add Member
          </Button>
        }
      >
        <Table<InstructorGroupMember>
          rowKey="userId"
          columns={memberColumns}
          dataSource={group?.members || []}
          pagination={false}
        />
      </Card>

      <Card
        loading={loading}
        title={
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-600" />
            <span>Project Details</span>
          </div>
        }
        extra={
          project && (
            <Button
              type="primary"
              icon={getStatusIcon(project.status)}
              onClick={() => {
                statusForm.setFieldsValue({
                  status: project.status,
                  comment: "",
                });
                setStatusModalOpen(true);
              }}
            >
              Update Status
            </Button>
          )
        }
      >
        {project ? (
          <>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Title" span={2}>
                <span className="font-medium text-base">{project.title}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {project.description || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={getStatusColor(project.status)}
                  icon={getStatusIcon(project.status)}
                >
                  {project.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Leader">
                {project.leaderName}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(project.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                {project.updatedAt
                  ? new Date(project.updatedAt).toLocaleDateString()
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Divider orientation="left" className="mt-6 mb-4">
              <span className="text-sm font-medium text-gray-600">
                Milestones Management
              </span>
            </Divider>

            <InstructorMilestones projectId={project.projectId} />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No project found for this group</p>
          </div>
        )}
      </Card>

      <Modal
        open={editModalOpen}
        title="Edit Group"
        onCancel={() => setEditModalOpen(false)}
        onOk={handleUpdateGroup}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={addMemberModalOpen}
        title="Add Member to Group"
        onCancel={() => setAddMemberModalOpen(false)}
        onOk={handleAddMember}
      >
        <Form form={addMemberForm} layout="vertical">
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="roleInGroup"
            label="Role"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select
              options={[
                { label: "Leader", value: "Leader" },
                { label: "Member", value: "Member" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={statusModalOpen}
        title="Update Project Status"
        onCancel={() => setStatusModalOpen(false)}
        onOk={handleUpdateProjectStatus}
        width={600}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select
              options={[
                { label: "Approved", value: "Approved" },
                { label: "Revision", value: "Revision" },
                { label: "Rejected", value: "Rejected" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ required: true, message: "Please provide feedback" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Provide feedback for the group..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
