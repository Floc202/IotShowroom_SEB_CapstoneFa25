import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, FileText, CheckCircle, XCircle } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  getGradingClasses,
  getGradingClassProjects,
} from "../../api/grading";
import type {
  GradingClass,
  GradingProject,
} from "../../types/grading";
import type { Id } from "../../types/base";
import { useNavigate } from "react-router-dom";

const GradingManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<GradingClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GradingClass | null>(null);
  const [projects, setProjects] = useState<GradingProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getGradingClasses();
      setClasses([...res.data].reverse());
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch grading classes"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (classId: Id) => {
    try {
      setProjectsLoading(true);
      const res = await getGradingClassProjects(classId);
      setProjects([...res.data].reverse());
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleViewProjects = (record: GradingClass) => {
    setSelectedClass(record);
    fetchProjects(record.classId);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setProjects([]);
  };

  const handleViewSubmission = (finalSubmissionId: Id) => {
    navigate(`/instructor/grading/submission?finalSubmissionId=${finalSubmissionId}`);
  };

  const classColumns: ColumnsType<GradingClass> = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
    },
    {
      title: "Total Projects",
      dataIndex: "totalProjects",
      key: "totalProjects",
      align: "center",
    },
    {
      title: "Graded",
      dataIndex: "gradedProjects",
      key: "gradedProjects",
      align: "center",
      render: (value: number) => <Tag color="success">{value}</Tag>,
    },
    {
      title: "Pending",
      dataIndex: "pendingProjects",
      key: "pendingProjects",
      align: "center",
      render: (value: number) => <Tag color="warning">{value}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          icon={<Eye size={16} />}
          onClick={() => handleViewProjects(record)}
        >
          View Projects
        </Button>
      ),
    },
  ];

  const projectColumns: ColumnsType<GradingProject> = [
    {
      title: "Project Name",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
    },
    {
      title: "Status",
      dataIndex: "hasMyGrade",
      key: "hasMyGrade",
      render: (hasMyGrade: boolean) =>
        hasMyGrade ? (
          <Tag icon={<CheckCircle size={14} />} color="success">
            Graded
          </Tag>
        ) : (
          <Tag icon={<XCircle size={14} />} color="warning">
            Pending
          </Tag>
        ),
    },
    {
      title: "Submitted At",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Your Grade",
      dataIndex: "myGrade",
      key: "myGrade",
      align: "center",
      render: (grade: number | null) => (grade !== null ? grade : "-"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileText size={16} />}
          onClick={() => handleViewSubmission(record.finalSubmissionId)}
        >
          View Submission
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {!selectedClass ? (
        <Card title="Grading Assignments" bordered={false}>
          <Table
            columns={classColumns}
            dataSource={classes}
            loading={loading}
            rowKey="classId"
            pagination={false}
          />
        </Card>
      ) : (
        <Card
          title={`Projects - ${selectedClass.className} (${selectedClass.semesterName})`}
          bordered={false}
          extra={<Button onClick={handleBackToClasses}>Back to Classes</Button>}
        >
          <Table
            columns={projectColumns}
            dataSource={projects}
            loading={projectsLoading}
            rowKey="finalSubmissionId"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default GradingManagement;
