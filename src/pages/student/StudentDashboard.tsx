import { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, List, Tag, Empty, Spin, Badge } from "antd";
import { BookOpen, Users, FolderOpen, TrendingUp, Award, Clock, Bell } from 'lucide-react';
import { getStudentDashboard } from "../../api/student";
import type { StudentDashboard as StudentDashboardType } from "../../types/student";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState<StudentDashboardType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getStudentDashboard();
      if (res.isSuccess && res.data) {
        setDashboard(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "green";
    if (grade >= 50) return "blue";
    if (grade >= 30) return "orange";
    return "red";
  };

  const getDeadlineColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return "red";
    if (daysRemaining <= 3) return "orange";
    if (daysRemaining <= 7) return "blue";
    return "green";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8">
        <Empty description="No dashboard data available" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {dashboard.studentName}! Here's your overview.</p>
      </div>

      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <Statistic
              title="Total Classes"
              value={dashboard.statistics.totalClasses}
              prefix={<BookOpen className="w-5 h-5" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <Statistic
              title="Total Groups"
              value={dashboard.statistics.totalGroups}
              prefix={<Users className="w-5 h-5" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <Statistic
              title="Total Projects"
              value={dashboard.statistics.totalProjects}
              prefix={<FolderOpen className="w-5 h-5" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <Statistic
              title="Average Grade"
              value={dashboard.statistics.averageGrade?.toFixed(1) ?? "N/A"}
              prefix={<Award className="w-5 h-5" />}
              suffix={dashboard.statistics.averageGrade !== null ? "%" : ""}
              valueStyle={{ 
                color: dashboard.statistics.averageGrade !== null 
                  ? dashboard.statistics.averageGrade >= 50 ? "#52c41a" : "#fa8c16"
                  : "#666"
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
            <Statistic
              title="Total Submissions"
              value={dashboard.statistics.totalSubmissions}
              prefix={<TrendingUp className="w-5 h-5" />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <Statistic
              title="Pending Submissions"
              value={dashboard.statistics.pendingSubmissions}
              prefix={<Clock className="w-5 h-5" />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card
          title={
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Upcoming Deadlines</span>
              <Badge count={dashboard.upcomingDeadlines.length} showZero />
            </div>
          }
          className="shadow-sm"
        >
          {dashboard.upcomingDeadlines.length > 0 ? (
            <List
              dataSource={dashboard.upcomingDeadlines}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.milestoneTitle}</span>
                        <Tag color={getDeadlineColor(item.daysRemaining)}>
                          {item.daysRemaining < 0 
                            ? `${Math.abs(item.daysRemaining)} days overdue`
                            : `${item.daysRemaining} days left`
                          }
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          Project: {item.projectTitle}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Due: {dayjs(item.deadline).format("MMM DD, YYYY")}</span>
                          <span>•</span>
                          <span>Weight: {item.weight}%</span>
                          <span>•</span>
                          <Tag color="blue" className="text-xs">{item.status}</Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No upcoming deadlines" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>Recent Grades</span>
              <Badge count={dashboard.recentGrades.length} showZero />
            </div>
          }
          className="shadow-sm"
        >
          {dashboard.recentGrades.length > 0 ? (
            <List
              dataSource={dashboard.recentGrades}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.milestoneTitle}</span>
                        <Tag color={getGradeColor(item.grade)} className="text-base font-semibold">
                          {item.grade}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          Project: {item.projectTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          Graded {dayjs(item.gradedAt).fromNow()}
                        </div>
                        {item.feedback && (
                          <div className="text-xs text-gray-600 italic">
                            Feedback: {item.feedback}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No grades yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <span>Recent Notifications</span>
            <Badge count={dashboard.recentNotifications.filter(n => !n.isRead).length} showZero />
          </div>
        }
        className="shadow-sm"
      >
        {dashboard.recentNotifications.length > 0 ? (
          <List
            dataSource={dashboard.recentNotifications}
            renderItem={(item) => (
              <List.Item className={!item.isRead ? "bg-blue-50" : ""}>
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <span className={!item.isRead ? "font-semibold" : ""}>{item.title}</span>
                      {!item.isRead && <Badge status="processing" text="New" />}
                    </div>
                  }
                  description={
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">{item.message}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{dayjs(item.createdAt).fromNow()}</span>
                        <span>•</span>
                        <Tag color="blue" className="text-xs">{item.type}</Tag>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;