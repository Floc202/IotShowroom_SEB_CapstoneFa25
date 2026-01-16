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
  Input,
  Table,
  Divider,
  Dropdown,
  Popconfirm,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeft,
  Settings,
  Users,
  Pencil,
  Eye,
  FolderKanban,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  Upload as UploadIcon,
} from "lucide-react";
import {
  getInstructorClasses,
  getClassConfig,
  updateClassConfig,
  getClassGroups,
  getClassTemplates,
  createProjectTemplate,
  getTemplateDetail,
  updateProjectTemplate,
  deleteProjectTemplate,
  getTemplateRegistrations,
  getClassStudentsWithGroups,
  createRandomGroups,
} from "../../api/instructor";
import {
  getSyllabusByClass,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  uploadSyllabusFile,
} from "../../api/syllabus";
import {
  bulkCreateMilestones,
  type BulkCreateMilestoneRequest,
} from "../../api/milestone";
import type {
  InstructorClassItem,
  ClassConfig,
  UpdateClassConfigRequest,
  InstructorGroupDetail,
  ProjectTemplate,
  CreateProjectTemplateRequest,
  UpdateProjectTemplateRequest,
  TemplateRegistration,
  StudentWithGroup,
  StudentsWithGroupsResponse,
  RandomGroupCreationResult,
} from "../../types/instructor";
import type {
  SyllabusByClass,
  CreateSyllabusRequest,
  UpdateSyllabusRequest,
} from "../../types/syllabus";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";
import SyllabusDetailModal from "../../components/syllabus/SyllabusDetailModal";
import MilestoneWarningsTab from "../../components/instructor/MilestoneWarningsTab";
import MembersTab from "../../components/instructor/MembersTab";
import RandomGroupModal from "../../components/instructor/RandomGroupModal";

export default function InstructorClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<InstructorClassItem | null>(null);
  const [config, setConfig] = useState<ClassConfig | null>(null);
  const [groups, setGroups] = useState<InstructorGroupDetail[]>([]);
  const [syllabuses, setSyllabuses] = useState<SyllabusByClass[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [students, setStudents] = useState<StudentWithGroup[]>([]);
  const [studentsInfo, setStudentsInfo] = useState<StudentsWithGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [syllabusModalOpen, setSyllabusModalOpen] = useState(false);
  const [syllabusDetailOpen, setSyllabusDetailOpen] = useState(false);
  const [syllabusFormMode, setSyllabusFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedSyllabus, setSelectedSyllabus] =
    useState<SyllabusByClass | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateDetailModalOpen, setTemplateDetailModalOpen] = useState(false);
  const [templateRegistrationsModalOpen, setTemplateRegistrationsModalOpen] =
    useState(false);
  const [templateFormMode, setTemplateFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [templateRegistrations, setTemplateRegistrations] = useState<
    TemplateRegistration[]
  >([]);
  const [configForm] = Form.useForm<UpdateClassConfigRequest>();
  const [syllabusForm] = Form.useForm<CreateSyllabusRequest>();
  const [fileListForm] = Form.useForm();
  const [templateForm] = Form.useForm<
    CreateProjectTemplateRequest | UpdateProjectTemplateRequest
  >();
  const [fileList, setFileList] = useState<any>([]);
  const [fileMetadata, setFileMetadata] = useState<
    { file: File; description: string; displayOrder: number }[]
  >([]);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [randomGroupModalOpen, setRandomGroupModalOpen] = useState(false);
  const [randomGroupResult, setRandomGroupResult] = useState<RandomGroupCreationResult | null>(null);
  const [randomGroupLoading, setRandomGroupLoading] = useState(false);

  const { TextArea } = Input;
  const [milestoneForm] = Form.useForm<BulkCreateMilestoneRequest>();

  const fetchClassData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const classId = parseInt(id);

      const [classesRes, configRes, groupsRes, syllabusRes, templatesRes, studentsRes] =
        await Promise.allSettled([
          getInstructorClasses(),
          getClassConfig(classId),
          getClassGroups(classId),
          getSyllabusByClass(classId),
          getClassTemplates(classId),
          getClassStudentsWithGroups(classId),
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

      if (syllabusRes.status === "fulfilled" && syllabusRes.value.isSuccess) {
        setSyllabuses(syllabusRes.value.data || []);
      }

      if (templatesRes.status === "fulfilled" && templatesRes.value.isSuccess) {
        setTemplates(templatesRes.value.data || []);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value.isSuccess) {
        setStudents(studentsRes.value.data?.students || []);
        setStudentsInfo(studentsRes.value.data || null);
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
          ? dayjs(values.groupFormationDeadline).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        projectCreationDeadline: values.projectCreationDeadline
          ? dayjs(values.projectCreationDeadline).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        submissionStartDate: values.submissionStartDate
          ? dayjs(values.submissionStartDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        submissionDeadline: values.submissionDeadline
          ? dayjs(values.submissionDeadline).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        editWindowStartDate: values.editWindowStartDate
          ? dayjs(values.editWindowStartDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
        editWindowEndDate: values.editWindowEndDate
          ? dayjs(values.editWindowEndDate).format('YYYY-MM-DDTHH:mm:ss')
          : null,
      };

      const res = await updateClassConfig(parseInt(id), payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Update failed");
        return;
      }

      toast.success("Configuration updated successfully");
      setConfigModalOpen(false);
      const configRes = await getClassConfig(parseInt(id));
      if (configRes.isSuccess) {
        setConfig(configRes.data || null);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleCreateSyllabus = async () => {
    if (!id) return;
    try {
      setSyllabusLoading(true);
      const values = await syllabusForm.validateFields();
      const payload: CreateSyllabusRequest = {
        classId: parseInt(id),
        title: values.title,
        description: values.description || "",
        version: values.version,
        academicYear: values.academicYear,
      };

      const res = await createSyllabus(payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Create failed");
        return;
      }

      const newSyllabusId = res.data?.syllabusId;

      if (newSyllabusId && fileMetadata.length > 0) {
        let successCount = 0;
        let failCount = 0;

        for (const item of fileMetadata) {
          try {
            const fileRes = await uploadSyllabusFile({
              syllabusId: newSyllabusId,
              file: item.file,
              description: item.description,
              displayOrder: item.displayOrder,
            });

            if (fileRes.isSuccess) {
              successCount++;
            } else {
              failCount++;
            }
          } catch {
            failCount++;
          }
        }

        if (failCount > 0) {
          toast.error(`${failCount} file(s) failed to upload`);
        }
        if (successCount > 0) {
          toast.success(`${successCount} file(s) uploaded successfully`);
        }
      }

      toast.success("Syllabus created successfully");
      setSyllabusModalOpen(false);
      syllabusForm.resetFields();
      fileListForm.resetFields();
      setFileList([]);
      setFileMetadata([]);
      const syllabusListRes = await getSyllabusByClass(parseInt(id));
      if (syllabusListRes.isSuccess) {
        setSyllabuses(syllabusListRes.data || []);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSyllabusLoading(false);
    }
  };

  const handleUpdateSyllabus = async () => {
    if (!id || !selectedSyllabus) return;
    try {
      const values = await syllabusForm.validateFields();
      const payload: UpdateSyllabusRequest = {
        title: values.title,
        description: values.description || "",
        version: values.version,
        academicYear: values.academicYear,
        isActive:
          (values as any).isActive !== undefined
            ? (values as any).isActive
            : true,
      };

      const res = await updateSyllabus(selectedSyllabus.syllabusId, payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Update failed");
        return;
      }

      toast.success("Syllabus updated successfully");
      setSyllabusModalOpen(false);
      syllabusForm.resetFields();
      const syllabusListRes = await getSyllabusByClass(parseInt(id));
      if (syllabusListRes.isSuccess) {
        setSyllabuses(syllabusListRes.data || []);
      }
      setSelectedSyllabus(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleBulkCreateMilestones = async () => {
    if (!id) return;
    try {
      setMilestoneLoading(true);
      const values = await milestoneForm.validateFields();
      const payload: BulkCreateMilestoneRequest = {
        classId: parseInt(id),
        title: values.title,
        description: values.description,
        dueDate: dayjs(values.dueDate).format("YYYY-MM-DD"),
        weight: values.weight,
      };

      const res = await bulkCreateMilestones(parseInt(id), payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to create milestones");
        return;
      }

      if (res.data?.warnings && res.data.warnings.length > 0) {
        toast.success(res?.message || "Milestones created with warnings");
        res.data.warnings.forEach((warning: string) => {
          toast.error(warning, { duration: 8000 });
        });
      } else {
        toast.success("Milestones created successfully for all projects");
      }

      setMilestoneModalOpen(false);
      milestoneForm.resetFields();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setMilestoneLoading(false);
    }
  };

  const handleCreateRandomGroups = async () => {
    if (!id) return;
    try {
      setRandomGroupLoading(true);
      const res = await createRandomGroups(parseInt(id));
      
      if (!res.isSuccess || !res.data) {
        toast.error(res.message || "Failed to create random groups");
        return;
      }

      setRandomGroupResult(res.data);
      toast.success(res.data.message || "Random groups created successfully");
      await fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setRandomGroupLoading(false);
    }
  };

  const handleDeleteSyllabus = async (syllabusId: number) => {
    try {
      const res = await deleteSyllabus(syllabusId);
      if (!res.isSuccess) {
        toast.error(res.message || "Delete failed");
        return;
      }

      toast.success("Syllabus deleted successfully");
      setSyllabuses(syllabuses.filter((s) => s.syllabusId !== syllabusId));
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleCreateTemplate = () => {
    if (!id) return;
    setTemplateFormMode("create");
    setSelectedTemplate(null);
    templateForm.resetFields();
    templateForm.setFieldsValue({
      classId: parseInt(id),
      title: "",
      description: "",
      component: "",
      maxGroups: 1,
      milestones: [],
    });
    setTemplateModalOpen(true);
  };

  const handleEditTemplate = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateDetail(template.templateId);
      if (res.isSuccess && res.data) {
        setSelectedTemplate(res.data);
        setTemplateFormMode("edit");
        templateForm.setFieldsValue({
          title: res.data.title,
          description: res.data.description,
          component: res.data.component,
          maxGroups: res.data.maxGroups,
          isActive: res.data.isActive,
        });
        setTemplateModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplateDetail = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateDetail(template.templateId);
      if (res.isSuccess && res.data) {
        setSelectedTemplate(res.data);
        setTemplateDetailModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleViewTemplateRegistrations = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const res = await getTemplateRegistrations(template.templateId);
      if (res.isSuccess && res.data) {
        setTemplateRegistrations(res.data);
        setSelectedTemplate(template);
        setTemplateRegistrationsModalOpen(true);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      const res = await deleteProjectTemplate(templateId);
      if (res.isSuccess) {
        toast.success("Template deleted successfully");
        if (id) {
          const templatesRes = await getClassTemplates(parseInt(id));
          if (templatesRes.isSuccess) {
            setTemplates(templatesRes.data || []);
          }
        }
      } else {
        toast.error(res.message || "Failed to delete template");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTemplate = async () => {
    if (!id) return;
    try {
      const values = await templateForm.validateFields();
      setLoading(true);

      if (templateFormMode === "create") {
        const formValues = values as CreateProjectTemplateRequest & {
          milestones?: any[];
        };
        const payload: CreateProjectTemplateRequest = {
          classId: parseInt(id),
          title: formValues.title,
          description: formValues.description,
          component: formValues.component,
          maxGroups: formValues.maxGroups,
          milestones: formValues.milestones || [],
        };
        const res = await createProjectTemplate(payload);
        if (res.isSuccess) {
          toast.success("Template created successfully");
          setTemplateModalOpen(false);
          const templatesRes = await getClassTemplates(parseInt(id));
          if (templatesRes.isSuccess) {
            setTemplates(templatesRes.data || []);
          }
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
        const res = await updateProjectTemplate(
          selectedTemplate.templateId,
          payload
        );
        if (res.isSuccess) {
          toast.success("Template updated successfully");
          setTemplateModalOpen(false);
          const templatesRes = await getClassTemplates(parseInt(id));
          if (templatesRes.isSuccess) {
            setTemplates(templatesRes.data || []);
          }
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

  const templateColumns: ColumnsType<ProjectTemplate> = [
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
      title: "Actions",
      key: "actions",
      width: 250,
      render: (_: any, record: ProjectTemplate) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewTemplateDetail(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => handleEditTemplate(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Users className="w-4 h-4" />}
            onClick={() => handleViewTemplateRegistrations(record)}
          >
            Registrations
          </Button>

          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
            onConfirm={() => handleDeleteTemplate(record.templateId)}
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
      title: "Registered By",
      dataIndex: "registeredByName",
      key: "registeredByName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          "Pending": "orange",
          "Approved": "green",
          "Rejected": "red",
          "Cancelled": "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
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
        defaultActiveKey="groups  "
        items={[
          {
            key: "groups",
            label: (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Groups ({groups.length})
              </span>
            ),
            children: (
              <Card
                loading={loading}
                title="Class Groups"
                extra={
                  <Button
                    type="default"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      milestoneForm.resetFields();
                      setMilestoneModalOpen(true);
                    }}
                  >
                    Create Milestones
                  </Button>
                }
              >
                {groups.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {groups.map((group) => (
                      <Col xs={24} sm={12} lg={8} key={group.groupId}>
                        <Card
                          hoverable
                          className="h-full transition-shadow hover:shadow-lg"
                          onClick={() =>
                            navigate(
                              `/instructor/classes/${id}/groups/${group.groupId}`
                            )
                          }
                          extra={
                            <Button
                              type="primary"
                              size="small"
                              icon={<Eye className="w-3 h-3" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/instructor/classes/${id}/groups/${group.groupId}`
                                );
                              }}
                            >
                              View
                            </Button>
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-green-600" />
                              <span className="font-semibold truncate">
                                {group.groupName}
                              </span>
                            </div>
                          }
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Avatar size={32} className="bg-blue-500">
                                {group.leaderName[0]}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-500">
                                  Leader
                                </div>
                                <div className="font-medium truncate">
                                  {group.leaderName}
                                </div>
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
                                <div className="text-xs text-gray-500">
                                  Members
                                </div>
                                <div className="font-semibold text-blue-600">
                                  {group.memberCount}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <FolderKanban className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="text-xs text-gray-500">
                                  Projects
                                </div>
                                <div className="font-semibold text-purple-600">
                                  {group.projectCount}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400 pt-2 border-t">
                              Created:{" "}
                              {new Date(group.createdAt).toLocaleDateString()}
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
          {
            key: "members",
            label: (
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Members ({students.length})
              </span>
            ),
            children: (
              <MembersTab
                loading={loading}
                students={students}
                studentsInfo={studentsInfo}
                onCreateRandomGroups={() => setRandomGroupModalOpen(true)}
              />
            ),
          },
          {
            key: "syllabus",
            label: (
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Syllabus ({syllabuses.length})
              </span>
            ),
            children: (
              <Card
                loading={loading}
                title="Class Syllabuses"
                extra={
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSyllabusFormMode("create");
                        setSelectedSyllabus(null);
                        syllabusForm.resetFields();
                        fileListForm.resetFields();
                        setSyllabusModalOpen(true);
                      }}
                    >
                      Add Syllabus
                    </Button>
                  </Space>
                }
              >
                {syllabuses.length > 0 ? (
                  <Table
                    columns={[
                      {
                        title: "Title",
                        dataIndex: "title",
                        key: "title",
                        render: (text: string) => (
                          <span className="font-medium">{text}</span>
                        ),
                      },
                      {
                        title: "Version",
                        dataIndex: "version",
                        key: "version",
                        width: 100,
                      },
                      {
                        title: "Academic Year",
                        dataIndex: "academicYear",
                        key: "academicYear",
                        width: 120,
                      },
                      {
                        title: "Created By",
                        dataIndex: "createdByName",
                        key: "createdByName",
                        width: 150,
                      },
                      {
                        title: "Files",
                        dataIndex: "fileCount",
                        key: "fileCount",
                        width: 80,
                        render: (count: number) => (
                          <Tag color="blue">{count}</Tag>
                        ),
                      },
                      {
                        title: "Status",
                        dataIndex: "isActive",
                        key: "isActive",
                        width: 100,
                        render: (isActive: boolean) => (
                          <Tag color={isActive ? "green" : "red"}>
                            {isActive ? "Active" : "Inactive"}
                          </Tag>
                        ),
                      },
                      {
                        title: "Actions",
                        key: "actions",
                        width: 80,
                        align: "center",
                        render: (_: any, record: SyllabusByClass) => (
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: "view",
                                  label: "View Detail",
                                  onClick: () => {
                                    setSelectedSyllabus(record);
                                    setSyllabusDetailOpen(true);
                                  },
                                },
                                {
                                  key: "edit",
                                  label: "Edit",
                                  onClick: () => {
                                    setSyllabusFormMode("edit");
                                    setSelectedSyllabus(record);
                                    syllabusForm.setFieldsValue({
                                      title: record.title,
                                      version: record.version,
                                      academicYear: record.academicYear,
                                    });
                                    setSyllabusModalOpen(true);
                                  },
                                },
                                {
                                  type: "divider",
                                },
                                {
                                  key: "delete",
                                  label: (
                                    <Popconfirm
                                      title="Delete Syllabus"
                                      description="Are you sure you want to delete this syllabus?"
                                      onConfirm={() =>
                                        handleDeleteSyllabus(record.syllabusId)
                                      }
                                      okText="Delete"
                                      okType="danger"
                                      cancelText="Cancel"
                                    >
                                      <span>Delete</span>
                                    </Popconfirm>
                                  ),
                                  danger: true,
                                },
                              ],
                            }}
                            trigger={["click"]}
                          >
                            <Button type="text" size="small">
                              ⋯
                            </Button>
                          </Dropdown>
                        ),
                      },
                    ]}
                    dataSource={syllabuses.map((s) => ({
                      ...s,
                      key: s.syllabusId,
                    }))}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1200 }}
                  />
                ) : (
                  <Empty description="No syllabuses found" />
                )}
              </Card>
            ),
          },
          {
            key: "templates",
            label: (
              <span className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Project Templates ({templates.length})
              </span>
            ),
            children: (
              <Card
                loading={loading}
                title="Project Templates"
                extra={
                  <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </Button>
                }
              >
                {templates.length > 0 ? (
                  <Table
                    columns={templateColumns}
                    dataSource={templates}
                    rowKey="templateId"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <Empty description="No templates found" />
                )}
              </Card>
            ),
          },
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
                          projectCreationDeadline: config.projectCreationDeadline
                            ? (dayjs(config.projectCreationDeadline) as any)
                            : null,
                          allowStudentCreateGroup:
                            config.allowStudentCreateGroup,
                          submissionStartDate: config.submissionStartDate
                            ? (dayjs(config.submissionStartDate) as any)
                            : null,
                          submissionDeadline: config.submissionDeadline
                            ? (dayjs(config.submissionDeadline) as any)
                            : null,
                          allowLateSubmission: config.allowLateSubmission,
                          lateSubmissionPenaltyPercent: config.lateSubmissionPenaltyPercent,
                          editWindowStartDate: config.editWindowStartDate
                            ? (dayjs(config.editWindowStartDate) as any)
                            : null,
                          editWindowEndDate: config.editWindowEndDate
                            ? (dayjs(config.editWindowEndDate) as any)
                            : null,
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
                    <Descriptions.Item label="Group Formation Deadline" span={2}>
                      {config.groupFormationDeadline
                        ? new Date(
                            config.groupFormationDeadline
                          ).toLocaleString()
                        : "No deadline set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Formation Status">
                      <Tag
                        color={config.isGroupFormationOpen ? "green" : "red"}
                      >
                        {config.groupFormationStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Student Can Create">
                      <Tag
                        color={config.allowStudentCreateGroup ? "green" : "red"}
                      >
                        {config.allowStudentCreateGroup ? "Yes" : "No"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Project Creation Deadline" span={2}>
                      {config.projectCreationDeadline
                        ? new Date(
                            config.projectCreationDeadline
                          ).toLocaleString()
                        : "No deadline set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Project Creation Status" span={2}>
                      <Tag
                        color={config.isProjectCreationOpen ? "green" : "red"}
                      >
                        {config.projectCreationStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Submission Start Date">
                      {config.submissionStartDate
                        ? new Date(config.submissionStartDate).toLocaleString()
                        : "Not set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Submission Deadline">
                      {config.submissionDeadline
                        ? new Date(config.submissionDeadline).toLocaleString()
                        : "Not set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Submission Status">
                      <Tag color={config.canSubmitNow ? "green" : "red"}>
                        {config.submissionPeriodStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Allow Late Submission">
                      <Tag color={config.allowLateSubmission ? "green" : "red"}>
                        {config.allowLateSubmission ? "Yes" : "No"}
                      </Tag>
                    </Descriptions.Item>
                    {config.lateSubmissionPenaltyPercent !== null && (
                      <Descriptions.Item label="Late Penalty" span={2}>
                        {config.lateSubmissionPenaltyPercent}%
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Edit Window Start">
                      {config.editWindowStartDate
                        ? new Date(config.editWindowStartDate).toLocaleString()
                        : "Not set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Edit Window End">
                      {config.editWindowEndDate
                        ? new Date(config.editWindowEndDate).toLocaleString()
                        : "Not set"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Edit Window Status">
                      <Tag color={config.canEditNow ? "green" : "red"}>
                        {config.editWindowStatus}
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
            key: "warnings",
            label: (
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings
              </span>
            ),
            children: (
              <Card loading={loading}>
                <MilestoneWarningsTab classId={parseInt(id || "0")} />
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
        width={900}
        style={{ top: 10 }}
      >
        <Form form={configForm} layout="vertical">
          <Divider orientation="left">Group Configuration</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxGroupsAllowed"
                label="Max Groups Allowed"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="groupFormationDeadline"
                label="Group Formation Deadline"
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minMembersPerGroup"
                label="Min Members Per Group"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxMembersPerGroup"
                label="Max Members Per Group"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber className="w-full" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="allowStudentCreateGroup"
            label="Allow Students to Create Groups"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider orientation="left">Project Configuration</Divider>
          <Form.Item
            name="projectCreationDeadline"
            label="Project Creation Deadline"
          >
            <DatePicker showTime className="w-full" />
          </Form.Item>

          <Divider orientation="left">Submission Configuration</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="submissionStartDate"
                label="Submission Start Date"
              >
                <DatePicker 
                  showTime 
                  className="w-full" 
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="submissionDeadline"
                label="Submission Deadline"
              >
                <DatePicker 
                  showTime 
                  className="w-full"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="allowLateSubmission"
                label="Allow Late Submission"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lateSubmissionPenaltyPercent"
                label="Late Submission Penalty (%)"
              >
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Edit Window Configuration</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="editWindowStartDate"
                label="Edit Window Start Date"
              >
                <DatePicker 
                  showTime 
                  className="w-full"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editWindowEndDate"
                label="Edit Window End Date"
              >
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        open={syllabusModalOpen}
        title={
          syllabusFormMode === "create" ? "Create Syllabus" : "Update Syllabus"
        }
        onCancel={() => {
          setSyllabusModalOpen(false);
          setSelectedSyllabus(null);
          syllabusForm.resetFields();
          fileListForm.resetFields();
          setFileList([]);
          setFileMetadata([]);
        }}
        onOk={
          syllabusFormMode === "create"
            ? handleCreateSyllabus
            : handleUpdateSyllabus
        }
        confirmLoading={syllabusLoading}
        width={700}
        style={{ top: 10 }}
      >
        <Form form={syllabusForm} layout="vertical">
          <Form.Item
            name="title"
            label="Syllabus Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g., CS101 Introduction to Computer Science" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Syllabus description (optional)"
            />
          </Form.Item>
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: "Version is required" }]}
          >
            <Input placeholder="e.g., 1.0" />
          </Form.Item>
          <Form.Item
            name="academicYear"
            label="Academic Year"
            rules={[{ required: true, message: "Academic year is required" }]}
          >
            <Input placeholder="e.g., 2024-2025" />
          </Form.Item>
          {syllabusFormMode === "edit" && (
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
          {syllabusFormMode === "create" && (
            <>
              <Divider />
              <h4 className="font-semibold mb-3">Add Files (Optional)</h4>
              <Upload
                multiple
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList((prev: any) => [...prev, file]);
                  setFileMetadata((prev) => [
                    ...prev,
                    {
                      file,
                      description: "",
                      displayOrder: prev.length + 1,
                    },
                  ]);
                  return false;
                }}
                onRemove={(file) => {
                  const index = fileList.indexOf(file);
                  setFileList((prev: any) =>
                    prev.filter((_: any, i: number) => i !== index)
                  );
                  setFileMetadata((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                <Button icon={<UploadIcon className="w-4 h-4" />}>
                  Choose Files
                </Button>
              </Upload>
              {fileMetadata.length > 0 && (
                <div className="mt-4 space-y-3">
                  {fileMetadata.map((item, index) => (
                    <Card
                      key={index}
                      size="small"
                      className="bg-gray-50"
                      extra={
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => {
                            const newFileList = fileList.filter(
                              (_: any, i: number) => i !== index
                            );
                            const newMetadata = fileMetadata
                              .filter((_, i) => i !== index)
                              .map((item, i) => ({
                                ...item,
                                displayOrder: i + 1,
                              }));
                            setFileList(newFileList);
                            setFileMetadata(newMetadata);
                          }}
                        />
                      }
                    >
                      <div className="space-y-2">
                        <div className="font-medium text-sm">
                          {item.file.name}
                        </div>
                        <Input
                          placeholder="Description (optional)"
                          value={item.description}
                          onChange={(e) => {
                            const newMetadata = [...fileMetadata];
                            newMetadata[index].description = e.target.value;
                            setFileMetadata(newMetadata);
                          }}
                        />
                        <InputNumber
                          placeholder="Display Order"
                          value={item.displayOrder}
                          min={1}
                          style={{ width: "100%" }}
                          onChange={(value) => {
                            const newMetadata = [...fileMetadata];
                            newMetadata[index].displayOrder = value || 1;
                            setFileMetadata(newMetadata);
                          }}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </Form>
      </Modal>

      <SyllabusDetailModal
        open={syllabusDetailOpen}
        syllabus={selectedSyllabus}
        onClose={() => setSyllabusDetailOpen(false)}
      />

      <Modal
        title={
          templateFormMode === "create" ? "Create Template" : "Edit Template"
        }
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        onOk={handleSubmitTemplate}
        confirmLoading={loading}
        width={800}
        okText={templateFormMode === "create" ? "Create" : "Update"}
      >
        <Form form={templateForm} layout="vertical">
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

          {templateFormMode === "edit" && (
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}

          {templateFormMode === "create" && (
            <Form.List name="milestones" initialValue={[]}>
              {(fields, { add, remove }) => (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Milestones</span>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<Plus className="w-4 h-4" />}
                    >
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
                        <TextArea
                          rows={2}
                          placeholder="Milestone description"
                        />
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "weight"]}
                            label="Weight"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: "100%" }}
                            />
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
        open={templateDetailModalOpen}
        onCancel={() => setTemplateDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setTemplateDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title">
                {selectedTemplate.title}
              </Descriptions.Item>
              <Descriptions.Item label="Component">
                {selectedTemplate.component}
              </Descriptions.Item>
              <Descriptions.Item label="Max Groups">
                {selectedTemplate.maxGroups}
              </Descriptions.Item>
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
        open={templateRegistrationsModalOpen}
        onCancel={() => setTemplateRegistrationsModalOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setTemplateRegistrationsModalOpen(false)}
          >
            Close
          </Button>,
        ]}
        width={700}
      >
        <Table
          columns={registrationColumns}
          dataSource={templateRegistrations}
          rowKey="registrationId"
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      <Modal
        title="Create Milestones for All Projects"
        open={milestoneModalOpen}
        onCancel={() => setMilestoneModalOpen(false)}
        onOk={handleBulkCreateMilestones}
        confirmLoading={milestoneLoading}
        width={600}
      >
        <Form form={milestoneForm} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter milestone title" },
            ]}
          >
            <Input placeholder="Enter milestone title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter milestone description" />
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select due date"
              disabledDate={(current) => current && current < dayjs().add(1, 'day').startOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="Weight (%)"
            name="weight"
            rules={[
              { required: true, message: "Please enter weight" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Weight must be between 0 and 100",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              placeholder="Enter weight (0-100)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <RandomGroupModal
        open={randomGroupModalOpen}
        loading={randomGroupLoading}
        result={randomGroupResult}
        config={config}
        onCancel={() => {
          setRandomGroupModalOpen(false);
          setRandomGroupResult(null);
        }}
        onCreate={handleCreateRandomGroups}
      />
    </div>
  );
}
