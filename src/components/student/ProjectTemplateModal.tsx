import { useState, useEffect } from "react";
import { Modal, Card, Tag, Button, Empty, Spin, Descriptions, Table, Popconfirm } from "antd";
import { Layers, CheckCircle, XCircle } from "lucide-react";
import {
  getStudentClassTemplates,
  getMyGroupRegistrations,
  registerTemplate,
  unregisterTemplate,
  type StudentProjectTemplate,
} from "../../api/studentTemplate";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface ProjectTemplateModalProps {
  open: boolean;
  classId: number;
  groupId: number | null;
  isLeader: boolean;
  onClose: () => void;
  onRegistrationChange?: () => void;
}

export default function ProjectTemplateModal({
  open,
  classId,
  groupId,
  onClose,
  onRegistrationChange,
}: ProjectTemplateModalProps) {
  const [templates, setTemplates] = useState<StudentProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, classId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const [templatesRes, registrationsRes] = await Promise.all([
        getStudentClassTemplates(classId),
        getMyGroupRegistrations(),
      ]);

      if (!templatesRes.isSuccess || !templatesRes.data) {
        setTemplates([]);
        return;
      }

      const templatesData = templatesRes.data;
      const registrationsData = registrationsRes.isSuccess ? registrationsRes.data : [];

      templatesData.forEach((template) => {
        const registration = registrationsData?.find(
          (reg) => reg.templateId === template.templateId
        );

        if (registration && registration.status !== "Cancelled" && registration.status !== "Rejected") {
          template.isMyGroupRegistered = true;
          template.myRegistrationId = registration.registrationId;
        } else {
          template.isMyGroupRegistered = false;
          template.myRegistrationId = undefined;
        }
      });

      setTemplates(templatesData);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (templateId: number) => {
    if (!groupId) {
      toast.error("You must be in a group to register");
      return;
    }

    try {
      setActionLoading(templateId);
      const res = await registerTemplate({ templateId, groupId });

      if (!res.isSuccess) {
        toast.error(res.message || "Registration failed");
        return;
      }

      toast.success("Template registered and project created successfully");
      await fetchTemplates();
      onRegistrationChange?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (myRegistrationId: number | undefined) => {
    if (!myRegistrationId) {
      toast.error("Registration ID not found");
      return;
    }

    try {
      setActionLoading(myRegistrationId);
      const res = await unregisterTemplate(myRegistrationId);

      if (!res.isSuccess) {
        toast.error(res.message || "Unregister failed");
        return;
      }

      toast.success("Template unregistered successfully");
      await fetchTemplates();
      onRegistrationChange?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Modal
      title="Project Templates"
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <Spin spinning={loading}>
        {templates.length === 0 ? (
          <Empty description="No project templates available" />
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card
                key={template.templateId}
                size="small"
                className="bg-gray-50"
                title={
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">{template.title}</span>
                  </div>
                }
                extra={
                  // isLeader && 
                  groupId ? (
                    template.isMyGroupRegistered ? (
                      <Button
                        danger
                        size="small"
                        icon={<XCircle className="w-4 h-4" />}
                        loading={actionLoading === template.myRegistrationId}
                        onClick={() => handleUnregister(template.myRegistrationId)}
                      >
                        Unregister
                      </Button>
                    ) : template.canRegister ? (
                      <Popconfirm
                        title="Register Project Template"
                        description={
                          <div className="max-w-xs">
                            <p className="mb-2">
                              When you register for "<strong>{template.title}</strong>", the system will automatically create a project for your group based on this template.
                            </p>
                            <p className="text-orange-600 font-medium">
                              Do you want to continue?
                            </p>
                          </div>
                        }
                        onConfirm={() => handleRegister(template.templateId)}
                        okText="Yes, Register"
                        cancelText="Cancel"
                        okType="primary"
                      >
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircle className="w-4 h-4" />}
                          loading={actionLoading === template.templateId}
                        >
                          Register
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Tag color="red">Full</Tag>
                    )
                  ) : template.isMyGroupRegistered ? (
                    <Tag color="green" icon={<CheckCircle className="w-4 h-4" />}>
                      Registered
                    </Tag>
                  ) : null
                }
              >
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="Component">
                    {template.component}
                  </Descriptions.Item>
                  <Descriptions.Item label="Available Slots">
                    <Tag color={template.availableSlots > 0 ? "green" : "red"}>
                      {template.availableSlots} / {template.maxGroups}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    {template.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="Registered Groups" span={2}>
                    {template.registeredCount}
                  </Descriptions.Item>
                </Descriptions>

                {template.milestones && template.milestones.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium mb-2 text-sm">
                      Milestones ({template.milestoneCount})
                    </h4>
                    <Table
                      dataSource={template.milestones}
                      rowKey="templateMilestoneId"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: "Order",
                          dataIndex: "orderIndex",
                          key: "orderIndex",
                          width: 70,
                        },
                        {
                          title: "Title",
                          dataIndex: "title",
                          key: "title",
                        },
                        {
                          title: "Weight",
                          dataIndex: "weight",
                          key: "weight",
                          width: 80,
                          render: (weight: number) => `${weight}%`,
                        },
                        {
                          title: "Duration",
                          dataIndex: "daysDuration",
                          key: "daysDuration",
                          width: 100,
                          render: (days: number) => `${days} days`,
                        },
                      ]}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
