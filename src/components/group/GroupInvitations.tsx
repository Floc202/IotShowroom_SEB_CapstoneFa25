import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Tag,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { getGroupInvitations, rejectGroupInvitation } from "../../api/student";
import { acceptInvite } from "../../api/group";
import type { GroupInvitation } from "../../types/student";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../providers/AuthProvider";
import { syncMembers } from "../../api/chat";
import { getGroupsByClass } from "../../api/group";

interface GroupInvitationsProps {
  onChanged?: () => void;
  classId?: number;
}

export default function GroupInvitations({ onChanged, classId }: GroupInvitationsProps) {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [rejectForm] = Form.useForm<{ reason: string }>();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await getGroupInvitations();
      if (res.isSuccess && res.data) {
        let filtered = res.data.pendingInvitations || [];
        
        if (classId) {
          filtered = filtered.filter(inv => inv.classId === classId);
        }
        
        setInvitations(filtered);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (groupId: number) => {
    if (!user?.userId) {
      toast.error("User not found");
      return;
    }

    try {
      setActionLoading(true);
      await acceptInvite({
        groupId,
        userId: user.userId,
      });

      // Sync chat members after accepting invitation
      try {
        const invitation = invitations.find(inv => inv.groupId === groupId);
        if (invitation) {
          // Fetch updated group members from .NET backend
          const groupsResponse = await getGroupsByClass(invitation.classId);
          const groups = groupsResponse.data || [];
          const group = groups.find((g: any) => g.groupId === groupId);

          if (group && group.members) {
            // Sync members with MongoDB
            await syncMembers(
              groupId,
              group.members.map((m: any) => ({
                userId: m.userId,
                email: m.email,
                fullName: m.fullName || '',
                avatarUrl: m.avatarUrl || '',
                roleInGroup: m.roleInGroup || 'Member',
              }))
            );
          }
        }
      } catch (chatError) {
        console.error('Error syncing chat members:', chatError);
        // Don't block invitation acceptance if chat sync fails
      }

      toast.success("Invitation accepted successfully");
      fetchInvitations();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (groupId: number) => {
    setSelectedGroupId(groupId);
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedGroupId) return;

    try {
      const values = await rejectForm.validateFields();
      setActionLoading(true);

      const res = await rejectGroupInvitation({
        groupId: selectedGroupId,
        reason: values.reason?.trim() || undefined,
      });

      if (!res.isSuccess) {
        toast.error(res.message || "Failed to reject invitation");
        return;
      }

      toast.success("Invitation rejected");
      setRejectModalOpen(false);
      rejectForm.resetFields();
      setSelectedGroupId(null);
      fetchInvitations();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnsType<GroupInvitation> = [
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Invited By",
      dataIndex: "invitedBy",
      key: "invitedBy",
      render: (text: string, record: GroupInvitation) => 
        text || record.inviterName || "-",
    },
    {
      title: "Invited At",
      dataIndex: "invitedAt",
      key: "invitedAt",
      render: (date: string, record: GroupInvitation) => {
        const dateStr = date || record.createdAt;
        return dateStr ? new Date(dateStr).toLocaleString() : "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: GroupInvitation) => (
        <Space>
          <Popconfirm
            title="Accept this invitation?"
            description={`Join group "${record.groupName}"?`}
            okText="Accept"
            cancelText="Cancel"
            onConfirm={() => handleAccept(record.groupId)}
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle className="w-4 h-4" />}
              loading={actionLoading}
            >
              Accept
            </Button>
          </Popconfirm>
          <Button
            danger
            size="small"
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => openRejectModal(record.groupId)}
            loading={actionLoading}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        loading={loading}
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            <span>Group Invitations</span>
            <Tag color="orange">{invitations.length}</Tag>
          </div>
        }
      >
        {invitations.length > 0 ? (
          <Table<GroupInvitation>
            rowKey={(record) => record.notificationId || record.invitationId || record.groupId}
            columns={columns}
            dataSource={invitations}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        ) : (
          <Empty description="No pending invitations" />
        )}
      </Card>

      <Modal
        open={rejectModalOpen}
        title="Reject Invitation"
        onCancel={() => {
          setRejectModalOpen(false);
          rejectForm.resetFields();
          setSelectedGroupId(null);
        }}
        onOk={handleReject}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason (Optional)"
            rules={[{ max: 500, message: "Reason too long" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter reason for rejecting..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
