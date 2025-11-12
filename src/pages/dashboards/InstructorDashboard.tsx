import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Timeline, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Users,
  FolderOpen,
  GraduationCap,
  FileCheck,
  AlertCircle,
  Activity,
} from "lucide-react";
import { getInstructorDashboard } from "../../api/instructor";
import type { InstructorDashboard, RecentActivity, InstructorClassItem } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<InstructorDashboard | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getInstructorDashboard();
      if (res.isSuccess && res.data) {
        setDashboard(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const classColumns: ColumnsType<InstructorClassItem> = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
      render: (text: string, record: InstructorClassItem) => (
        <a
          onClick={() => navigate(`/instructor/classes/${record.classId}`)}
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
    },
    {
      title: "Students",
      dataIndex: "totalStudents",
      key: "totalStudents",
      width: 100,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Groups",
      dataIndex: "totalGroups",
      key: "totalGroups",
      width: 100,
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "Projects",
      dataIndex: "totalProjects",
      key: "totalProjects",
      width: 100,
      render: (count: number) => <Tag color="purple">{count}</Tag>,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "announcement":
        return <AlertCircle className="w-4 h-4" />;
      case "grade":
        return <FileCheck className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600">Overview of your classes and activities</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Classes"
              value={dashboard?.totalClasses || 0}
              prefix={<GraduationCap className="w-5 h-5" />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Students"
              value={dashboard?.totalStudents || 0}
              prefix={<Users className="w-5 h-5" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Groups"
              value={dashboard?.totalGroups || 0}
              prefix={<Users className="w-5 h-5" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Projects"
              value={dashboard?.totalProjects || 0}
              prefix={<FolderOpen className="w-5 h-5" />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Pending Proposals"
              value={dashboard?.pendingProposals || 0}
              prefix={<AlertCircle className="w-5 h-5" />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card loading={loading}>
            <Statistic
              title="Submissions to Grade"
              value={dashboard?.submissionsToGrade || 0}
              prefix={<FileCheck className="w-5 h-5" />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Recent Classes"
            loading={loading}
            className="shadow-sm"
          >
            {dashboard?.recentClasses && dashboard.recentClasses.length > 0 ? (
              <Table<InstructorClassItem>
                rowKey="classId"
                columns={classColumns}
                dataSource={dashboard.recentClasses}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty description="No classes found" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Recent Activities"
            loading={loading}
            className="shadow-sm"
          >
            {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
              <Timeline
                items={dashboard.recentActivities.map((activity: RecentActivity) => ({
                  dot: getActivityIcon(activity.activityType),
                  children: (
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-xs text-gray-500">
                        {activity.relatedClass || "All Classes"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.activityDate).toLocaleString()}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="No recent activities" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
