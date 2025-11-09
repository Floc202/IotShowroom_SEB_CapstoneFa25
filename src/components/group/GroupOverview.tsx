import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Tag, Space, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Users } from "lucide-react";
import { getGroupById } from "../../api/group";
import type { GroupDetail, GroupMember } from "../../types/group";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

export default function GroupOverview({ groupId }: { groupId: number }) {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const d = await getGroupById(groupId);
      setDetail(d);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [groupId]);

  const columns: ColumnsType<GroupMember> = useMemo(
    () => [
      { title: "User ID", dataIndex: "userId", key: "userId", width: 120 },
      {
        title: "Role",
        dataIndex: "roleInGroup",
        key: "roleInGroup",
        width: 140,
        render: (v: string) => (
          <Tag color={v === "Leader" ? "gold" : "blue"}>{v}</Tag>
        ),
      },
      { title: "Joined At", dataIndex: "joinedAt", key: "joinedAt" },
    ],
    []
  );

  return (
    <Card
      loading={loading}
      className="shadow-sm mb-important"
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Group Overview</span>
        </div>
      }
      extra={<span className="text-sm text-gray-500">#{groupId}</span>}
    >
      {detail && (
        <Space direction="vertical" className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Typography.Text strong>{detail.groupName}</Typography.Text>
            <Tag color="purple">
              {detail.projectIds?.length || 0} project(s)
            </Tag>
          </div>
          <Table<GroupMember>
            rowKey="gmId"
            columns={columns}
            dataSource={detail.members}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        </Space>
      )}
    </Card>
  );
}
