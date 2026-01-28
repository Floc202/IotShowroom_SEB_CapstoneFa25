import { useState, useEffect } from "react";
import { Card, Descriptions, Table, Tag, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Award } from "lucide-react";
import { getStudentProjectGrades } from "../../api/student";
import { getProjectGrades } from "../../api/instructor";
import type { StudentProjectGrades, StudentMilestoneGrade } from "../../types/student";
import type { ProjectGrade } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface ProjectGradesCardProps {
  projectId: number;
  role: "student" | "instructor";
}

export default function ProjectGradesCard({ projectId, role }: ProjectGradesCardProps) {
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<StudentProjectGrades | null>(null);
  const [instructorGrades, setInstructorGrades] = useState<ProjectGrade[]>([]);

  useEffect(() => {
    fetchGrades();
  }, [projectId, role]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      
      if (role === "student") {
        const res = await getStudentProjectGrades(projectId);
        if (res.isSuccess && res.data) {
          setStudentGrades(res.data);
        }
      } else {
        const res = await getProjectGrades(projectId);
        if (res.isSuccess && res.data) {
          setInstructorGrades(res.data);
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "default";
    if (grade >= 80) return "green";
    if (grade >= 50) return "blue";
    if (grade >= 30) return "orange";
    return "red";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "graded":
        return "green";
      case "pending":
        return "blue";
      case "submitted":
        return "orange";
      default:
        return "default";
    }
  };

  if (role === "student" && !studentGrades) {
    return null;
  }

  if (role === "student") {
    const studentColumns: ColumnsType<StudentMilestoneGrade> = [
      {
        title: "Milestone",
        dataIndex: "milestoneTitle",
        key: "milestoneTitle",
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "Weight (%)",
        dataIndex: "weight",
        key: "weight",
        width: 100,
        render: (weight: number) => `${weight}%`,
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        width: 100,
        render: (grade: number | null) => 
          grade !== null ? (
            <Tag color={getGradeColor(grade)} className="text-base font-semibold">
              {grade}
            </Tag>
          ) : (
            <Tag color="default">—</Tag>
          ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        ),
      },
      {
        title: "Graded By",
        dataIndex: "gradedBy",
        key: "gradedBy",
        render: (text: string | null) => text || "—",
      },
      {
        title: "Graded At",
        dataIndex: "gradedAt",
        key: "gradedAt",
        render: (date: string | null) => 
          date ? new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) : "—",
      },
      {
        title: "Feedback",
        dataIndex: "feedback",
        key: "feedback",
        render: (text: string | null) => text || "—",
      },
    ];

    return (
      <Card
        loading={loading}
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Project Grades</span>
          </div>
        }
      >
        {studentGrades ? (
          studentGrades.projectStatus === "Completed" ? (
            <>
              {/* <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12}>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <Statistic
                      title="Total Weighted Score"
                      value={studentGrades.gradeBreakdown.totalWeightedScore}
                      prefix={<TrendingUp className="w-5 h-5" />}
                      suffix={`/ ${studentGrades.gradeBreakdown.totalWeight}`}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <Statistic
                      title="Projected Final"
                      value={studentGrades.gradeBreakdown.projectedFinalGrade}
                      prefix={<Target className="w-5 h-5" />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row> */}

              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="mb-4">
                <Descriptions.Item label="Project">
                  {studentGrades.projectTitle}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getGradeColor(studentGrades.overallGrade)}>
                    {studentGrades.projectStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Class">
                  {studentGrades.className}
                </Descriptions.Item>
                <Descriptions.Item label="Semester">
                  {studentGrades.semesterName}
                </Descriptions.Item>
                <Descriptions.Item label="Group">
                  {studentGrades.groupName}
                </Descriptions.Item>
              </Descriptions>

              <Table<StudentMilestoneGrade>
                rowKey="milestoneId"
                columns={studentColumns}
                dataSource={studentGrades.milestones}
                pagination={false}
              />
            </>
          ) : (
            <Empty 
              description={
                <span>
                  Grades will be available once the project is completed.
                  <br />
                  Current status: <Tag color={getGradeColor(null)}>{studentGrades.projectStatus}</Tag>
                </span>
              }
            />
          )
        ) : (
          <Empty description="No grades available yet" />
        )}
      </Card>
    );
  }

  const instructorColumns: ColumnsType<ProjectGrade> = [
    {
      title: "Milestone",
      dataIndex: "milestoneTitle",
      key: "milestoneTitle",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Weight (%)",
      dataIndex: "weightRatioSnapshot",
      key: "weightRatioSnapshot",
      width: 100,
      render: (weight: number) => `${weight}%`,
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 100,
      render: (score: number) => (
        <Tag color={getGradeColor(score)} className="text-base font-semibold">
          {score}
        </Tag>
      ),
    },
    {
      title: "Graded By",
      dataIndex: "instructorName",
      key: "instructorName",
    },
    {
      title: "Evaluated At",
      dataIndex: "evaluatedAt",
      key: "evaluatedAt",
      render: (date: string) => new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
    },
    {
      title: "Feedback",
      dataIndex: "feedback",
      key: "feedback",
      render: (text: string) => text || "—",
    },
  ];

  return (
    <Card
      loading={loading}
      className="shadow-sm"
      title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          <span>Milestone Grades ({instructorGrades.length})</span>
        </div>
      }
    >
      {instructorGrades.length > 0 ? (
        <Table<ProjectGrade>
          rowKey="meId"
          columns={instructorColumns}
          dataSource={instructorGrades}
          pagination={false}
        />
      ) : (
        <Empty description="No grades recorded yet" />
      )}
    </Card>
  );
}
