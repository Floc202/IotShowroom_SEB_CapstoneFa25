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
  InputNumber,
  Switch,
  DatePicker,
  Empty,
  Tabs,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeft, Settings, Users, Pencil } from "lucide-react";
import {
  getInstructorClasses,
  getClassConfig,
  updateClassConfig,
  getClassGroups,
} from "../../api/instructor";
import type {
  InstructorClassItem,
  ClassConfig,
  UpdateClassConfigRequest,
  InstructorGroupDetail,
} from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

export default function InstructorClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<InstructorClassItem | null>(null);
  const [config, setConfig] = useState<ClassConfig | null>(null);
  const [groups, setGroups] = useState<InstructorGroupDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configForm] = Form.useForm<UpdateClassConfigRequest>();

  const fetchClassData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const classId = parseInt(id);

      const [classesRes, configRes, groupsRes] = await Promise.allSettled([
        getInstructorClasses(),
        getClassConfig(classId),
        getClassGroups(classId),
      ]);

      if (classesRes.status === "fulfilled" && classesRes.value.isSuccess) {
        const cls = classesRes.value.data?.find((c) => c.classId === classId);
        setClassData(cls || null);
      }

      if (configRes.status === "fulfilled" && configRes.value.isSuccess) {
        setConfig(configRes.value.data || null);
      }

      if (groupsRes.status === "fulfilled" && groupsRes.value.isSuccess) {
        setGroups(groupsRes.value.data || []);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const handleUpdateConfig = async () => {
    if (!id) return;
    try {
      const values = await configForm.validateFields();
      const payload: UpdateClassConfigRequest = {
        ...values,
        groupFormationDeadline: values.groupFormationDeadline
          ? dayjs(values.groupFormationDeadline).toISOString()
          : null,
      };

      const res = await updateClassConfig(parseInt(id), payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Update failed");
        return;
      }

      toast.success("Configuration updated successfully");
      setConfigModalOpen(false);
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const groupColumns: ColumnsType<InstructorGroupDetail> = [
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text: string, record: InstructorGroupDetail) => (
        <a
          onClick={() => navigate(`/instructor/classes/${id}/groups/${record.groupId}`)}
          className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Leader",
      dataIndex: "leaderName",
      key: "leaderName",
    },
    {
      title: "Members",
      dataIndex: "memberCount",
      key: "memberCount",
      width: 100,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Projects",
      dataIndex: "projectCount",
      key: "projectCount",
      width: 100,
      render: (count: number) => <Tag color="purple">{count}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  if (!classData && !loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>
        <Empty description="Class not found" />
      </div>
    );
  }

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
            <span className="text-xl font-bold">{classData?.className}</span>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Semester">
            {classData?.semesterName}
          </Descriptions.Item>
          <Descriptions.Item label="Semester Code">
            {classData?.semesterCode}
          </Descriptions.Item>
          <Descriptions.Item label="Students">
            <Tag color="blue">{classData?.totalStudents}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Groups">
            <Tag color="green">{classData?.totalGroups}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Projects">
            <Tag color="purple">{classData?.totalProjects}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {classData?.createdAt
              ? new Date(classData.createdAt).toLocaleDateString()
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey="config"
        items={[
          {
            key: "config",
            label: (
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </span>
            ),
            children: (
              <Card
                loading={loading}
                title="Class Configuration"
                extra={
                  <Button
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => {
                      if (config) {
                        configForm.setFieldsValue({
                          maxGroupsAllowed: config.maxGroupsAllowed,
                          minMembersPerGroup: config.minMembersPerGroup,
                          maxMembersPerGroup: config.maxMembersPerGroup,
                          groupFormationDeadline: config.groupFormationDeadline
                            ? (dayjs(config.groupFormationDeadline) as any)
                            : null,
                          allowStudentCreateGroup: config.allowStudentCreateGroup,
                        });
                      }
                      setConfigModalOpen(true);
                    }}
                  >
                    Edit Config
                  </Button>
                }
              >
                {config ? (
                  <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="Max Groups">
                      {config.maxGroupsAllowed}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Groups">
                      <Tag color="blue">{config.currentGroupCount}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Min Members/Group">
                      {config.minMembersPerGroup}
                    </Descriptions.Item>
                    <Descriptions.Item label="Max Members/Group">
                      {config.maxMembersPerGroup}
                    </Descriptions.Item>
                    <Descriptions.Item label="Formation Deadline" span={2}>
                      {config.groupFormationDeadline
                        ? new Date(config.groupFormationDeadline).toLocaleString()
                        : "No deadline set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={config.isGroupFormationOpen ? "green" : "red"}>
                        {config.deadlineStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Student Can Create">
                      <Tag color={config.allowStudentCreateGroup ? "green" : "red"}>
                        {config.allowStudentCreateGroup ? "Yes" : "No"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="No configuration found" />
                )}
              </Card>
            ),
          },
          {
            key: "groups",
            label: (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Groups ({groups.length})
              </span>
            ),
            children: (
              <Card loading={loading} title="Class Groups">
                {groups.length > 0 ? (
                  <Table<InstructorGroupDetail>
                    rowKey="groupId"
                    columns={groupColumns}
                    dataSource={groups}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                  />
                ) : (
                  <Empty description="No groups found" />
                )}
              </Card>
            ),
          },
        ]}
      />

      <Modal
        open={configModalOpen}
        title="Update Class Configuration"
        onCancel={() => setConfigModalOpen(false)}
        onOk={handleUpdateConfig}
        width={600}
      >
        <Form form={configForm} layout="vertical">
          <Form.Item
            name="maxGroupsAllowed"
            label="Max Groups Allowed"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="minMembersPerGroup"
            label="Min Members Per Group"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="maxMembersPerGroup"
            label="Max Members Per Group"
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="groupFormationDeadline"
            label="Group Formation Deadline"
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item
            name="allowStudentCreateGroup"
            label="Allow Students to Create Groups"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
