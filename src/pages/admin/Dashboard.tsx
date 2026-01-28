import { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, List, Tag, Empty, Spin, Typography, Select } from "antd";
import { BookOpen, Users, FolderOpen, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getAdminOverview, getAdminStatistics, getClassesBySemesterChart, getProjectDistributionChart, getPassNotPassStatistics } from "../../api/admin";
import { listSemesters } from "../../api/semesters";
import type { AdminOverview, AdminStatistics, ChartResponse, PassNotPassStatistics } from "../../types/admin";
import type { Semester } from "../../types/semesters";
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
  const [passNotPass, setPassNotPass] = useState<PassNotPassStatistics | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedSemester]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, statsRes, classesRes, projectsRes, semestersRes, passNotPassRes] = await Promise.all([
        getAdminOverview(),
        getAdminStatistics(),
        getClassesBySemesterChart(),
        getProjectDistributionChart(),
        listSemesters(),
        getPassNotPassStatistics(selectedSemester),
      ]);

      if (overviewRes.isSuccess && overviewRes.data) setOverview(overviewRes.data);
      if (statsRes.isSuccess && statsRes.data) setStatistics(statsRes.data);
      if (classesRes.isSuccess && classesRes.data) setClassesBySemester(classesRes.data);
      if (projectsRes.isSuccess && projectsRes.data) setProjectDistribution(projectsRes.data);
      if (semestersRes.isSuccess && semestersRes.data) setSemesters(semestersRes.data);
      if (passNotPassRes.isSuccess && passNotPassRes.data) setPassNotPass(passNotPassRes.data);
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
                <Legend 
                  content={() => {
                    return (
                      <div className="flex justify-center gap-4 mt-2 flex-wrap">
                        {classesBySemester?.chartData.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: entry.color || "#1890ff" }}
                            />
                            <span className="text-sm text-gray-600">{entry.label}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
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
                  nameKey="label"
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

      <Card
        title={
          <div className="flex items-center justify-between">
            <span>
              Student Pass/Not Pass Statistics {selectedSemester ? '(By Semester)' : '(All Semesters)'}
            </span>
            <Select
              style={{ width: 200 }}
              placeholder="All Semesters"
              value={selectedSemester}
              onChange={setSelectedSemester}
              allowClear
              onClear={() => setSelectedSemester(undefined)}
            >
              {semesters.map((semester) => (
                <Select.Option key={semester.semesterId} value={semester.semesterId}>
                  {semester.name} ({semester.code})
                </Select.Option>
              ))}
            </Select>
          </div>
        }
        className="!mb-6"
      >
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">
                {selectedSemester ? 'Selected Semester Statistics' : 'All Semesters Statistics'}
              </h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Card className="bg-blue-50">
                    <Statistic
                      title="Total Students"
                      value={passNotPass?.overall.totalStudents || 0}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="bg-green-50">
                    <Statistic
                      title="Passed"
                      value={passNotPass?.overall.passedStudents || 0}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="bg-red-50">
                    <Statistic
                      title="Not Passed"
                      value={passNotPass?.overall.notPassedStudents || 0}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passNotPass?.overall.labels.map((label, index) => ({
                    name: label,
                    value: passNotPass.overall.values[index],
                  })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell fill="#52c41a" />
                  <Cell fill="#ff4d4f" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Col>
          <Col xs={24} lg={12}>
            <h3 className="text-lg font-semibold mb-3">By Semester Breakdown</h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart 
                data={passNotPass?.bySemester.map((sem) => ({
                  name: sem.semesterCode,
                  fullName: sem.semesterName,
                  Passed: sem.passedStudents,
                  "Not Passed": sem.notPassedStudents,
                  passRate: sem.passRate,
                })) || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  content={(props) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
                          <p className="text-sm text-green-600">
                            Passed: <span className="font-medium">{data.Passed}</span>
                          </p>
                          <p className="text-sm text-red-600">
                            Not Passed: <span className="font-medium">{data["Not Passed"]}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="Passed" fill="#52c41a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Not Passed" fill="#ff4d4f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Col>
        </Row>
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
