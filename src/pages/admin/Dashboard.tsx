import { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, List, Tag, Empty, Spin, Typography } from "antd";
import { BookOpen, Users, FolderOpen, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getAdminOverview, getAdminStatistics, getClassesBySemesterChart, getProjectDistributionChart, getMilestoneCompletionChart } from "../../api/admin";
import type { AdminOverview, AdminStatistics, ChartResponse } from "../../types/admin";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title } = Typography;

export default function Dashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [classesBySemester, setClassesBySemester] = useState<ChartResponse | null>(null);
  const [projectDistribution, setProjectDistribution] = useState<ChartResponse | null>(null);
  const [milestoneCompletion, setMilestoneCompletion] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, statsRes, classesRes, projectsRes, milestonesRes] = await Promise.all([
        getAdminOverview(),
        getAdminStatistics(),
        getClassesBySemesterChart(),
        getProjectDistributionChart(),
        getMilestoneCompletionChart(),
      ]);

      if (overviewRes.isSuccess && overviewRes.data) setOverview(overviewRes.data);
      if (statsRes.isSuccess && statsRes.data) setStatistics(statsRes.data);
      if (classesRes.isSuccess && classesRes.data) setClassesBySemester(classesRes.data);
      if (projectsRes.isSuccess && projectsRes.data) setProjectDistribution(projectsRes.data);
      if (milestonesRes.isSuccess && milestonesRes.data) setMilestoneCompletion(milestonesRes.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!overview || !statistics) {
    return (
      <div className="p-8">
        <Empty description="No dashboard data available" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Title level={2}>Admin Dashboard</Title>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Classes"
              value={overview.totalClasses}
              prefix={<BookOpen className="w-5 h-5" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Instructors"
              value={overview.totalInstructors}
              prefix={<Users className="w-5 h-5" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={overview.totalStudents}
              prefix={<Users className="w-5 h-5" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Groups"
              value={overview.totalGroups}
              prefix={<FolderOpen className="w-5 h-5" />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={overview.totalProjects}
              prefix={<FolderOpen className="w-5 h-5" />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Semesters"
              value={overview.activeSemesterCount}
              prefix={<CheckCircle className="w-5 h-5" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={overview.pendingApprovals}
              prefix={<AlertCircle className="w-5 h-5" />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={overview.completedProjects}
              prefix={<CheckCircle className="w-5 h-5" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title={classesBySemester?.title || "Classes by Semester"}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classesBySemester?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff">
                  {classesBySemester?.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#1890ff"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={projectDistribution?.title || "Project Status Distribution"}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(projectDistribution?.chartData || []) as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.label}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectDistribution?.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title={milestoneCompletion?.title || "Milestone Completion"}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={milestoneCompletion?.chartData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#1890ff" strokeWidth={2}>
              {milestoneCompletion?.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#1890ff"} />
              ))}
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title={
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Recent Activities</span>
          </div>
        }
      >
        {overview.recentActivities.length > 0 ? (
          <List
            dataSource={overview.recentActivities}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <Tag color="blue">{item.activityType}</Tag>
                      <span>{item.description}</span>
                    </div>
                  }
                  description={
                    <div className="text-xs text-gray-500">
                      <span>{dayjs(item.activityDate).fromNow()}</span>
                      <span> • by {item.performedBy}</span>
                      {item.relatedEntity && <span> • {item.relatedEntity}</span>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No recent activities" />
        )}
      </Card>
    </div>
  );
}
