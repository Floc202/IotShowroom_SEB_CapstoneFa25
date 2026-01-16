import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
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
  Row,
  Col,
  Descriptions,
  Empty,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Users,
  ArrowLeft,
} from "lucide-react";
import {
  getInstructorClasses,
  createProjectTemplate,
  getClassTemplates,
  getTemplateDetail,
  updateProjectTemplate,
  deleteProjectTemplate,
  getTemplateRegistrations,
} from "../../api/instructor";
import type {
  InstructorClassItem,
  ProjectTemplate,
  CreateProjectTemplateRequest,
  UpdateProjectTemplateRequest,
  TemplateRegistration,
} from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

const { TextArea } = Input;

export default function ProjectTemplates() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<InstructorClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [registrations, setRegistrations] = useState<TemplateRegistration[]>([]);
  const [form] = Form.useForm<CreateProjectTemplateRequest | UpdateProjectTemplateRequest>();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTemplates();
    } else {
      setTemplates([]);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await getInstructorClasses();
      if (res.isSuccess && res.data) {
        setClasses(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchTemplates = async () => {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const res = await getClassTemplates(selectedClassId);
      if (res.isSuccess && res.data) {
        setTemplates(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormMode("create");
    setSelectedTemplate(null);
    form.resetFields();
    form.setFieldsValue({
      classId: selectedClassId || 0,
      title: "",
      description: "",
      component: "",
      maxGroups: 1,
      milestones: [],
    });
    setModalOpen(true);
  };

  const handleEdit = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateDetail(template.templateId);
      if (res.isSuccess && res.data) {
        setSelectedTemplate(res.data);
        setFormMode("edit");
        form.setFieldsValue({
          title: res.data.title,
          description: res.data.description,
          component: res.data.component,
          maxGroups: res.data.maxGroups,
          isActive: res.data.isActive,
        });
        setModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateDetail(template.templateId);
      if (res.isSuccess && res.data) {
        setSelectedTemplate(res.data);
        setDetailModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateRegistrations(template.templateId);
      if (res.isSuccess && res.data) {
        setRegistrations(res.data);
        setSelectedTemplate(template);
        setRegistrationsModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (templateId: number) => {
    try {
      setLoading(true);
      const res = await deleteProjectTemplate(templateId);
      if (res.isSuccess) {
        toast.success("Template deleted successfully");
        fetchTemplates();
      } else {
        toast.error(res.message || "Failed to delete template");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (formMode === "create") {
        const formValues = values as CreateProjectTemplateRequest & { milestones?: any[] };
        const payload: CreateProjectTemplateRequest = {
          classId: selectedClassId!,
          title: formValues.title,
          description: formValues.description,
          component: formValues.component,
          maxGroups: formValues.maxGroups,
          milestones: formValues.milestones || [],
        };
        const res = await createProjectTemplate(payload);
        if (res.isSuccess) {
          toast.success("Template created successfully");
          setModalOpen(false);
          fetchTemplates();
        } else {
          toast.error(res.message || "Failed to create template");
        }
      } else {
        if (!selectedTemplate) return;
        const formValues = values as UpdateProjectTemplateRequest;
        const payload: UpdateProjectTemplateRequest = {
          title: formValues.title,
          description: formValues.description,
          component: formValues.component,
          maxGroups: formValues.maxGroups,
          isActive: formValues.isActive,
        };
        const res = await updateProjectTemplate(selectedTemplate.templateId, payload);
        if (res.isSuccess) {
          toast.success("Template updated successfully");
          setModalOpen(false);
          fetchTemplates();
        } else {
          toast.error(res.message || "Failed to update template");
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProjectTemplate> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Component",
      dataIndex: "component",
      key: "component",
      width: 150,
    },
    {
      title: "Max Groups",
      dataIndex: "maxGroups",
      key: "maxGroups",
      width: 100,
      align: "center",
    },
    {
      title: "Registrations",
      dataIndex: "totalRegistrations",
      key: "totalRegistrations",
      width: 120,
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_: any, record: ProjectTemplate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Users className="w-4 h-4" />}
            onClick={() => handleViewRegistrations(record)}
          >
            Registrations
          </Button>
        
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template? This action cannot be undone if there are registrations."
            onConfirm={() => handleDelete(record.templateId)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const registrationColumns: ColumnsType<TemplateRegistration> = [
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
    },
    {
      title: "Registered At",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Project",
      key: "project",
      render: (_: any, record: TemplateRegistration) =>
        record.projectTitle ? (
          <Tag color="green">{record.projectTitle}</Tag>
        ) : (
          <Tag color="default">No Project</Tag>
        ),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7" />
            Project Templates
          </h1>
          <p className="text-gray-600">Manage project templates for your classes</p>
        </div>
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/instructor/classes")}
        >
          Back to Classes
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="middle" className="w-full">
          <Space size="middle" wrap>
            <Select
              placeholder="Select a class"
              style={{ width: 300 }}
              value={selectedClassId}
              onChange={setSelectedClassId}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={classes.map((cls) => ({
                value: cls.classId,
                label: `${cls.className} - ${cls.semesterName}`,
              }))}
            />
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreate}
              disabled={!selectedClassId}
            >
              Create Template
            </Button>
          </Space>

          {selectedClassId && (
            <Table
              columns={columns}
              dataSource={templates}
              loading={loading}
              rowKey="templateId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: (
                  <Empty
                    description="No templates found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={formMode === "create" ? "Create Template" : "Edit Template"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={800}
        okText={formMode === "create" ? "Create" : "Update"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter template title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter template description" />
          </Form.Item>

          <Form.Item
            name="component"
            label="Component"
            rules={[{ required: true, message: "Please enter component" }]}
          >
            <Input placeholder="Enter component name" />
          </Form.Item>

          <Form.Item
            name="maxGroups"
            label="Max Groups"
            rules={[
              { required: true, message: "Please enter max groups" },
              { type: "number", min: 1, message: "Must be at least 1" },
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {formMode === "edit" && (
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}

          {formMode === "create" && (
            <Form.List name="milestones" initialValue={[]}>
              {(fields, { add, remove }) => (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Milestones</span>
                    <Button type="dashed" onClick={() => add()} icon={<Plus className="w-4 h-4" />}>
                      Add Milestone
                    </Button>
                  </div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" className="mb-2">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "title"]}
                            label="Title"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Milestone title" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "orderIndex"]}
                            label="Order"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Description"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <TextArea rows={2} placeholder="Milestone description" />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "weight"]}
                            label="Weight"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber min={0} max={100} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "daysDuration"]}
                            label="Days Duration"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label=" ">
                            <Button
                              danger
                              onClick={() => remove(name)}
                              icon={<Trash2 className="w-4 h-4" />}
                            >
                              Remove
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </>
              )}
            </Form.List>
          )}
        </Form>
      </Modal>

      <Modal
        title="Template Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title">{selectedTemplate.title}</Descriptions.Item>
              <Descriptions.Item label="Component">{selectedTemplate.component}</Descriptions.Item>
              <Descriptions.Item label="Max Groups">{selectedTemplate.maxGroups}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedTemplate.isActive ? "green" : "default"}>
                  {selectedTemplate.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Registrations" span={2}>
                {selectedTemplate.totalRegistrations}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedTemplate.description}
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {new Date(selectedTemplate.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Milestones</h4>
              <Table
                dataSource={selectedTemplate.milestones}
                rowKey="milestoneId"
                pagination={false}
                columns={[
                  {
                    title: "Order",
                    dataIndex: "orderIndex",
                    key: "orderIndex",
                    width: 80,
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
                    width: 100,
                  },
                  {
                    title: "Duration (Days)",
                    dataIndex: "daysDuration",
                    key: "daysDuration",
                    width: 120,
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Template Registrations"
        open={registrationsModalOpen}
        onCancel={() => setRegistrationsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setRegistrationsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <Table
          columns={registrationColumns}
          dataSource={registrations}
          rowKey="registrationId"
          pagination={{ pageSize: 10 }}
        />
      </Modal>

    </div>
  );
}

