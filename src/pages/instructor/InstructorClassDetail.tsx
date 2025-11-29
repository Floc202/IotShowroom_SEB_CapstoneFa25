import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Switch,
  DatePicker,
  Empty,
  Tabs,
  Row,
  Col,
  Avatar,
} from "antd";
import { ArrowLeft, Settings, Users, Pencil, Eye, FolderKanban } from "lucide-react";
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
                  <Row gutter={[16, 16]}>
                    {groups.map((group) => (
                      <Col xs={24} sm={12} lg={8} key={group.groupId}>
                        <Card
                          hoverable
                          className="h-full transition-shadow hover:shadow-lg"
                          onClick={() => navigate(`/instructor/classes/${id}/groups/${group.groupId}`)}
                          extra={
                            <Button
                              type="primary"
                              size="small"
                              icon={<Eye className="w-3 h-3" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/instructor/classes/${id}/groups/${group.groupId}`);
                              }}
                            >
                              View
                            </Button>
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-green-600" />
                              <span className="font-semibold truncate">{group.groupName}</span>
                            </div>
                          }
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Avatar size={32} className="bg-blue-500">
                                {group.leaderName[0]}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500">Leader</div>
                                <div className="font-medium truncate">{group.leaderName}</div>
                              </div>
                            </div>

                            {group.description && (
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {group.description}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-xs text-gray-500">Members</div>
                                <div className="font-semibold text-blue-600">{group.memberCount}</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <FolderKanban className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="text-xs text-gray-500">Projects</div>
                                <div className="font-semibold text-purple-600">{group.projectCount}</div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400 pt-2 border-t">
                              Created: {new Date(group.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
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
