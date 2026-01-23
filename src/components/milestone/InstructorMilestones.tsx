import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Tag,
  Empty,
  Dropdown,
  Popconfirm,
  type MenuProps,
} from "antd";
import { useAuth } from "../../providers/AuthProvider";
import type { ColumnsType } from "antd/es/table";
import { Plus, Pencil, Trash2, Calendar, MoreHorizontal, Eye, Award } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import type { Id } from "../../types/base";
import type { Milestone } from "../../types/milestone";
import {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../../api/instructorMilestone";
import { gradeMilestone, getProjectGrades } from "../../api/instructor";
import type { GradeMilestoneRequest, ProjectGrade } from "../../types/instructor";
import SubmissionHistoryView from "../submission/SubmissionHistoryView";
import { getSubmissionHistory } from "../../api/submission";
import type { SubmissionHistory } from "../../types/submission";

interface InstructorMilestonesProps {
  projectId: Id;
}

export default function InstructorMilestones({
  projectId,
}: InstructorMilestonesProps) {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [grades, setGrades] = useState<ProjectGrade[]>([]);
  const [submissions, setSubmissions] = useState<Map<Id, SubmissionHistory>>(new Map());
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [gradingMilestone, setGradingMilestone] = useState<Milestone | null>(
    null
  );
  const [viewingMilestone, setViewingMilestone] = useState<Milestone | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const [form] = Form.useForm<{
    title: string;
    description: string;
    dueDate: dayjs.Dayjs;
    status: string;
    weight: number;
  }>();

  const [gradeForm] = Form.useForm<{
    score: number;
    feedback: string;
  }>();

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const [milestonesRes, gradesRes] = await Promise.all([
        getProjectMilestones(projectId),
        getProjectGrades(projectId)
      ]);
      
      if (milestonesRes.isSuccess && milestonesRes.data) {
        setMilestones(milestonesRes.data);
        
        const submissionMap = new Map<Id, SubmissionHistory>();
        await Promise.all(
          milestonesRes.data.map(async (milestone) => {
            try {
              const submissionRes = await getSubmissionHistory(projectId, milestone.milestoneId);
              if (submissionRes.isSuccess && submissionRes.data) {
                submissionMap.set(milestone.milestoneId, submissionRes.data);
              }
            } catch (error) {
              console.error(`Failed to fetch submissions for milestone ${milestone.milestoneId}`);
            }
          })
        );
        setSubmissions(submissionMap);
      }
      
      if (gradesRes.isSuccess && gradesRes.data) {
        setGrades(gradesRes.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const handleOpenModal = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      form.setFieldsValue({
        title: milestone.title,
        description: milestone.description || "",
        dueDate: dayjs(milestone.dueDate),
        status: milestone.status,
        weight: milestone.weight || 0,
      });
    } else {
      setEditingMilestone(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMilestone(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);

      if (editingMilestone) {
        const payload = {
          projectId,
          title: values.title,
          description: values.description,
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          status: values.status,
          weight: values.weight,
        };

        const res = await updateMilestone(projectId, editingMilestone.milestoneId, payload);

        if (!res.isSuccess) {
          toast.error(res.message || "Update failed");
          return;
        }

        setMilestones(
          milestones.map((m) =>
            m.milestoneId === editingMilestone.milestoneId
              ? { ...m, ...values, dueDate: payload.dueDate }
              : m
          )
        );

        toast.success("Milestone updated successfully");
      } else {
        const payload = {
          projectId,
          title: values.title,
          description: values.description,
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          weight: values.weight,
        };

        const res = await createMilestone(projectId, payload);

        if (!res.isSuccess || !res.data) {
          toast.error(res.message || "Create failed");
          return;
        }

        setMilestones([...milestones, res.data]);

        toast.success("Milestone created successfully");
      }

      handleCloseModal();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (milestoneId: Id) => {
    try {
      setActionLoading(true);
      const res = await deleteMilestone(projectId, milestoneId);

      if (!res.isSuccess) {
        toast.error(res.message || "Delete failed");
        return;
      }

      setMilestones(milestones.filter((m) => m.milestoneId !== milestoneId));

      toast.success("Milestone deleted successfully");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSubmission = (milestone: Milestone) => {
    setViewingMilestone(milestone);
    setSubmissionModalOpen(true);
  };

  const handleOpenGradeModal = (milestone: Milestone) => {
    const submissionHistory = submissions.get(milestone.milestoneId);
    const hasSubmissions = submissionHistory && submissionHistory.allVersions && submissionHistory.allVersions.length > 0;
    
    if (!hasSubmissions) {
      toast.error("Cannot grade milestone: Student has not submitted any work yet");
      return;
    }
    
    const isAlreadyGraded = grades.some(g => g.milestoneDefId === milestone.milestoneId);
    if (isAlreadyGraded) {
      toast.error("Cannot grade milestone: This milestone has already been graded");
      return;
    }
    
    setGradingMilestone(milestone);
    gradeForm.resetFields();
    setGradeModalOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!gradingMilestone) return;
    try {
      const values = await gradeForm.validateFields();
      setActionLoading(true);

      const payload: GradeMilestoneRequest = {
        projectId,
        milestoneDefId: gradingMilestone.milestoneId,
        instructorId: user?.userId || 0,
        score: values.score,
        feedback: values.feedback,
        weightRatioSnapshot: gradingMilestone.weight || 0,
      };

      const res = await gradeMilestone(payload);

      if (!res.isSuccess) {
        toast.error(res.message || "Grading failed");
        return;
      }

      toast.success("Submission graded successfully");
      setGradeModalOpen(false);
      gradeForm.resetFields();
      setGradingMilestone(null);
      
      const gradesRes = await getProjectGrades(projectId);
      if (gradesRes.isSuccess && gradesRes.data) {
        setGrades(gradesRes.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planned":
        return "blue";
      case "open":
        return "cyan";
      case "completed":
        return "green";
      case "overdue":
        return "red";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Milestone> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: (date: string) => {
        const dueDate = dayjs(date);
        const now = dayjs();
        const isOverdue = dueDate.isBefore(now, "day");
        const isDueSoon =
          !isOverdue && dueDate.diff(now, "day") <= 7 && dueDate.diff(now, "day") >= 0;

        return (
          <span
            className={`${
              isOverdue
                ? "text-red-600 font-semibold"
                : isDueSoon
                ? "text-orange-600 font-medium"
                : ""
            }`}
          >
            {dueDate.format("MMM DD, YYYY")}
            {isOverdue && " (Overdue)"}
            {isDueSoon && " (Due Soon)"}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      render: (weight: number | null) => (weight ? `${weight}%` : "—"),
    },
    {
      title: "Grade",
      key: "grade",
      width: 120,
      render: (_: any, record: Milestone) => {
        const grade = grades.find(g => g.milestoneDefId === record.milestoneId);
        if (grade) {
          const getGradeColor = (score: number) => {
            if (score >= 80) return "green";
            if (score >= 50) return "blue";
            if (score >= 30) return "orange";
            return "red";
          };
          
          return (
            <Tag color={getGradeColor(grade.score)} className="font-semibold">
              {grade.score}
            </Tag>
          );
        }
        return <Tag color="default">Not Graded</Tag>;
      },
    },
    // {
    //   title: "Graded By",
    //   key: "gradedBy",
    //   width: 120,
    //   render: (_: any, record: Milestone) => {
    //     const grade = grades.find(g => g.milestoneDefId === record.milestoneId);
    //     return grade ? grade.instructorName : "—";
    //   },
    // },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Milestone) => {
        const submissionHistory = submissions.get(record.milestoneId);
        const hasSubmissions = submissionHistory && submissionHistory.allVersions && submissionHistory.allVersions.length > 0;
        const isAlreadyGraded = grades.some(g => g.milestoneDefId === record.milestoneId);
        
        const menuItems: MenuProps["items"] = [
          {
            key: "view",
            label: "View Submissions",
            icon: <Eye className="w-4 h-4" />,
            onClick: () => handleViewSubmission(record),
          },
          ...(hasSubmissions && !isAlreadyGraded ? [{
            key: "grade",
            label: "Grade Milestone",
            icon: <Award className="w-4 h-4" />,
            onClick: () => handleOpenGradeModal(record),
          }] : []),
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => handleOpenModal(record),
          },
          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete milestone?"
                description="Are you sure you want to delete this milestone?"
                onConfirm={() => handleDelete(record.milestoneId)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <span className="text-red-500">Delete</span>
              </Popconfirm>
            ),
            icon: <Trash2 className="w-4 h-4" />,
            danger: true,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button
              type="text"
              size="small"
              icon={<MoreHorizontal className="w-4 h-4" />}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-lg">Milestones</span>
          <Tag color="purple">{milestones.length}</Tag>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          Add Milestone
        </Button>
      </div>

      {milestones.length > 0 ? (
        <Table
          columns={columns}
          dataSource={milestones}
          rowKey="milestoneId"
          loading={loading}
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      ) : (
        <Empty description="No milestones created yet" />
      )}

      <Modal
        title={editingMilestone ? "Edit Milestone" : "Create Milestone"}
        open={modalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        okText={editingMilestone ? "Update" : "Create"}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            weight: 0,
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter milestone title" }]}
          >
            <Input placeholder="e.g., Design Phase, Implementation" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter milestone description" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe what needs to be accomplished..."
            />
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: "Please select due date" }]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>

          {editingMilestone && (
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select>
                <Select.Option value="Open">Open</Select.Option>
                <Select.Option value="Completed">Completed</Select.Option>
                <Select.Option value="Overdue">Overdue</Select.Option>
                <Select.Option value="Closed">Closed</Select.Option>
              </Select>
            </Form.Item>
          )}

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
              className="w-full"
              min={0}
              max={100}
              precision={0}
              placeholder="e.g., 20"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Grade Milestone - ${gradingMilestone?.title || ''}`}
        open={gradeModalOpen}
        onCancel={() => {
          setGradeModalOpen(false);
          gradeForm.resetFields();
          setGradingMilestone(null);
        }}
        onOk={() => gradeForm.submit()}
        confirmLoading={actionLoading}
        okText="Submit Grade"
        width={600}
      >
        <Form
          form={gradeForm}
          layout="vertical"
          onFinish={handleGradeSubmit}
        >
          <Form.Item
            label="Score"
            name="score"
            rules={[
              { required: true, message: "Please enter score" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Score must be between 0 and 100",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              max={100}
              precision={2}
              placeholder="e.g., 85.5"
            />
          </Form.Item>

          <Form.Item
            label="Feedback"
            name="feedback"
            rules={[{ required: true, message: "Please enter feedback" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Provide detailed feedback for the student..."
            />
          </Form.Item>

          {gradingMilestone && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Weight:</span> {gradingMilestone.weight || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This weight will be automatically applied to the grade
              </p>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        title="Milestone Submissions"
        open={submissionModalOpen}
        onCancel={() => {
          setSubmissionModalOpen(false);
          setViewingMilestone(null);
        }}
        footer={null}
        width={900}
        style={{top: 20}}
      >
        {viewingMilestone && (
          <SubmissionHistoryView
            projectId={projectId}
            milestoneId={viewingMilestone.milestoneId}
            milestoneTitle={viewingMilestone.title}
            role="instructor"
          />
        )}
      </Modal>
    </>
  );
}
