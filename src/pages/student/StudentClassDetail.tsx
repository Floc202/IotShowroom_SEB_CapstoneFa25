import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Tag, Descriptions, Button, Empty, Tooltip, Space } from "antd";
import { ArrowLeft, FolderOpen, Users, Plus, RefreshCcw } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type { StudentClassItem } from "../../types/student";
import { createGroup, getGroupById } from "../../api/group";
import { getErrorMessage } from "../../utils/helpers";
import CreateGroupModal from "../../components/group/CreateGroupModal";
import GroupOverview from "../../components/group/GroupOverview";
import GroupActions from "../../components/group/GroupActions";

export default function StudentClassDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const initial: StudentClassItem | undefined = state as
    | StudentClassItem
    | undefined;

  const [cls, setCls] = useState<StudentClassItem | undefined>(initial);
  const [groupLoading, setGroupLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (!cls?.myGroup?.groupId) return;
    const groupId = cls.myGroup.groupId;
    (async () => {
      try {
        setGroupLoading(true);
        const detail = await getGroupById(groupId);
        setCls((prev) =>
          prev
            ? {
                ...prev,
                myGroup: {
                  groupId: detail.groupId,
                  groupName: detail.groupName,
                },
              }
            : prev
        );
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setGroupLoading(false);
      }
    })();
  }, [cls?.myGroup?.groupId]);

  if (!cls) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          type="default"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
          className="mb-4 mb-important"
        >
          Back
        </Button>
        <Empty
          description={
            <span>
              No class data <b>#{id}</b>. Please go back to the list.
            </span>
          }
        />
      </div>
    );
  }

  const onCreate = async (groupName: string, description?: string) => {
    try {
      const res = await createGroup({
        classId: cls.classId,
        groupName: groupName.trim(),
        description: description?.trim() || undefined,
      });

      const g = res.data;
      setCls((prev) =>
        prev
          ? { ...prev, myGroup: { groupId: g.groupId, groupName: g.groupName } }
          : prev
      );
      toast.success("Group created");
      setOpenCreate(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <Space className="w-full justify-between">
        <Button
          type="default"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
          className="font-medium mb-important"
        >
          Back
        </Button>
        {cls.myGroup && (
          <Button
            icon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => setCls({ ...cls })}
            loading={groupLoading}
          >
            Refresh
          </Button>
        )}
      </Space>

      <Card
        className="shadow-sm border-t-4 border-t-blue-500 mb-important"
        title={
          <div className="flex items-center gap-3 py-1">
            <FolderOpen size={24} className="text-blue-600" />
            <span className="text-xl font-bold text-gray-800">
              {cls.className}
            </span>
            <Tag color="blue">{cls.semesterName}</Tag>
          </div>
        }
        extra={
          !cls.myGroup ? (
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setOpenCreate(true)}
            >
              Create Group
            </Button>
          ) : null
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
          <Descriptions.Item label="Instructor" span={1}>
            <span className="font-medium text-gray-700">
              {cls.instructorName ?? "—"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Enrolled At" span={1}>
            <Tooltip
              title={dayjs(cls.enrolledAt).format("dddd, MMM DD YYYY HH:mm")}
            >
              {dayjs(cls.enrolledAt).format("YYYY-MM-DD")}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="Class ID" span={1}>
            #{cls.classId}
          </Descriptions.Item>
          <Descriptions.Item label="My Group" span={3}>
            {cls.myGroup ? (
              <Tag icon={<Users className="w-3.5 h-3.5" />} color="green">
                {cls.myGroup.groupName}
              </Tag>
            ) : (
              <Tag color="default">— Not joined —</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {cls.myGroup && (
        <>
          <GroupOverview groupId={cls.myGroup.groupId} />
          <GroupActions
            classId={cls.classId}
            groupId={cls.myGroup.groupId}
            onChanged={() => setCls({ ...cls })}
          />
        </>
      )}

      <CreateGroupModal
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onCreate={onCreate}
      />
    </div>
  );
}
