import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Tag, Descriptions, Button, Empty, Tooltip, Space } from "antd";
import { ArrowLeft, FolderOpen, Users, Plus, RefreshCcw } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type { StudentClassItem } from "../../types/student";
import { createGroup, getGroupsByClass } from "../../api/group";
import { getStudentClasses } from "../../api/student";
import { getErrorMessage } from "../../utils/helpers";
import CreateGroupModal from "../../components/group/CreateGroupModal";
import GroupAndProjectOverview from "../../components/group/GroupAndProjectOverview";
import GroupInvitations from "../../components/group/GroupInvitations";
import { useAuth } from "../../providers/AuthProvider";

export default function StudentClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [cls, setCls] = useState<StudentClassItem | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchClassData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const classId = parseInt(id);

      const [classesRes, groupsRes] = await Promise.all([
        getStudentClasses(),
        getGroupsByClass(classId),
      ]);

      const classData = classesRes.data?.find((c) => c.classId === classId);

      if (!classData) {
        setCls(undefined);
        return;
      }

      const userGroup = groupsRes.data?.find((g) =>
        g.members?.some((m) => m.userId === user?.userId)
      );

      setCls({
        ...classData,
        myGroup: userGroup
          ? {
              groupId: userGroup.groupId,
              groupName: userGroup.groupName,
            }
          : null,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [id, user?.userId]);

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
      await createGroup({
        classId: cls!.classId,
        groupName: groupName.trim(),
        description: description?.trim() || undefined,
      });

      toast.success("Group created");
      setOpenCreate(false);
      fetchClassData();
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
        <Button
          icon={<RefreshCcw className="w-4 h-4" />}
          onClick={fetchClassData}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>

      <Card
        loading={loading}
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

      {!cls.myGroup && <GroupInvitations onChanged={fetchClassData} />}

      {cls.myGroup && (
        <GroupAndProjectOverview
          classId={cls.classId}
          groupId={cls.myGroup.groupId}
          onChanged={fetchClassData}
        />
      )}

      <CreateGroupModal
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onCreate={onCreate}
      />
    </div>
  );
}
