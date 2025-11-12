import { useMemo } from "react";
import { Card, Table, Tag, Space, Button, Popconfirm, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Users, UserPlus, Pencil, LogOut, UserMinus } from "lucide-react";
import type { GroupDetail, GroupMember } from "../../types/group";

interface GroupOverviewCardProps {
  detail: GroupDetail;
  loading: boolean;
  isLeader: boolean;
  currentUserId?: number;
  onInvite: () => void;
  onUpdate: () => void;
  onKick: (userId: number) => void;
  onLeave: () => void;
}

export default function GroupOverviewCard({
  detail,
  loading,
  isLeader,
  currentUserId,
  onInvite,
  onUpdate,
  onKick,
  onLeave,
}: GroupOverviewCardProps) {
  const columns: ColumnsType<GroupMember> = useMemo(
    () => [
      {
        title: "Member",
        key: "member",
        render: (_: any, record: GroupMember) => (
          <div className="flex items-center gap-3">
            <Avatar src={record.avatarUrl || undefined} size={40}>
              {record.fullName?.[0] || record.userId.toString()[0]}
            </Avatar>
            <div>
              <div className="font-medium">
                {record.fullName || `User #${record.userId}`}
              </div>
              <div className="text-xs text-gray-500">{record.email || "—"}</div>
            </div>
          </div>
        ),
      },
      {
        title: "Role",
        dataIndex: "roleInGroup",
        key: "roleInGroup",
        width: 140,
        render: (v: string) => (
          <Tag color={v === "Leader" ? "gold" : "blue"}>{v}</Tag>
        ),
      },
      {
        title: "Joined At",
        dataIndex: "joinedAt",
        key: "joinedAt",
        width: 180,
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      ...(isLeader
        ? [
            {
              title: "Action",
              key: "action",
              width: 100,
              render: (_: any, record: GroupMember) => {
                const canKick = record.userId !== currentUserId;
                
                return canKick ? (
                  <Popconfirm
                    title="Kick this member?"
                    description={`Remove ${
                      record.fullName ||
                      record.email ||
                      `User #${record.userId}`
                    } from group?`}
                    okText="Kick"
                    okType="danger"
                    onConfirm={() => onKick(record.userId)}
                  >
                    <Button
                      size="small"
                      danger
                      type="text"
                      icon={<UserMinus className="w-4 h-4" />}
                    >
                      Kick
                    </Button>
                  </Popconfirm>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                );
              },
            },
          ]
        : []),
    ],
    [isLeader, currentUserId, onKick]
  );

  return (
    <Card
      loading={loading}
      className="shadow-sm"
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Group Overview</span>
        </div>
      }
    >
      {detail && (
        <Space direction="vertical" className="w-full" size="large">
          {isLeader && (
            <div className="">
              <div className="text-sm font-medium mb-3 text-gray-700">
                Quick Actions
              </div>
              <Space wrap>
                <Button
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={onInvite}
                >
                  Invite Member
                </Button>
                <Button
                  icon={<Pencil className="w-4 h-4" />}
                  onClick={onUpdate}
                >
                  Update Group
                </Button>
              </Space>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Members ({detail.members.length})
              </span>
              <Button
                type="text"
                danger
                size="small"
                icon={<LogOut className="w-4 h-4" />}
                onClick={onLeave}
              >
                Leave Group
              </Button>
            </div>
            <Table<GroupMember>
              rowKey="gmId"
              columns={columns}
              dataSource={detail.members}
              pagination={{ pageSize: 5, showSizeChanger: true }}
            />
          </div>
        </Space>
      )}
    </Card>
  );
}
