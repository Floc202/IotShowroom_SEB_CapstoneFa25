import { useState, useEffect } from "react";
import { Card, Select, Tabs, Table, Spin, Empty, Typography, Row, Col, Statistic, Tag, Button } from "antd";
import { FileText, Users, FolderOpen, TrendingUp, BookOpen, Award, Download } from "lucide-react";
import {
  getInstructorsWorkloadReport,
  getStudentsDistributionReport,
  getProjectsStatusReport,
  getMilestoneProgressReport,
  getGradesDistributionReport,
  exportComprehensiveReport,
} from "../../api/admin";
import { listSemesters } from "../../api/semesters";
import type {
  InstructorsWorkloadReport,
  StudentsDistributionReport,
  ProjectsStatusReport,
  MilestoneProgressReport,
  GradesDistributionReport,
} from "../../types/admin";
import type { Semester } from "../../types/semesters";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

const { Title } = Typography;
const { TabPane } = Tabs;

export default function AdminReports() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("instructors");

  const [instructorsReport, setInstructorsReport] = useState<InstructorsWorkloadReport | null>(null);
  const [studentsReport, setStudentsReport] = useState<StudentsDistributionReport | null>(null);
  const [projectsReport, setProjectsReport] = useState<ProjectsStatusReport | null>(null);
  const [milestonesReport, setMilestonesReport] = useState<MilestoneProgressReport | null>(null);
  const [gradesReport, setGradesReport] = useState<GradesDistributionReport | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedSemester, activeTab]);

  const fetchSemesters = async () => {
    try {
      const res = await listSemesters();
      if (res.isSuccess && res.data) {
        setSemesters(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleExportReport = async () => {
    if (!selectedSemester) {
      toast.error("Please select a semester to export");
      return;
    }

    try {
      setExporting(true);
      const blob = await exportComprehensiveReport(selectedSemester);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive-report-${selectedSemester}-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const query = selectedSemester ? { semesterId: selectedSemester } : {};

      switch (activeTab) {
        case "instructors":
          const iRes = await getInstructorsWorkloadReport(query);
          if (iRes.isSuccess && iRes.data) setInstructorsReport(iRes.data);
          break;
        case "students":
          const sRes = await getStudentsDistributionReport(query);
          if (sRes.isSuccess && sRes.data) setStudentsReport(sRes.data);
          break;
        case "projects":
          const pRes = await getProjectsStatusReport(query);
          if (pRes.isSuccess && pRes.data) setProjectsReport(pRes.data);
          break;
        case "milestones":
          const mRes = await getMilestoneProgressReport(query);
          if (mRes.isSuccess && mRes.data) setMilestonesReport(mRes.data);
          break;
        case "grades":
          const gRes = await getGradesDistributionReport(query);
          if (gRes.isSuccess && gRes.data) setGradesReport(gRes.data);
          break;
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const instructorColumns = [
    { title: "Instructor Name", dataIndex: "instructorName", key: "instructorName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Classes", dataIndex: "classCount", key: "classCount", sorter: (a: any, b: any) => b.classCount - a.classCount },
    { title: "Total Students", dataIndex: "totalStudents", key: "totalStudents", sorter: (a: any, b: any) => b.totalStudents - a.totalStudents },
    { title: "Total Groups", dataIndex: "totalGroups", key: "totalGroups", sorter: (a: any, b: any) => b.totalGroups - a.totalGroups },
    { title: "Pending Proposals", dataIndex: "pendingProposals", key: "pendingProposals" },
    { title: "To Grade", dataIndex: "submissionsToGrade", key: "submissionsToGrade" },
  ];

  const studentsBySemesterColumns = [
    { title: "Semester", dataIndex: "semesterName", key: "semesterName" },
    { title: "Total Students", dataIndex: "studentCount", key: "studentCount" },
    { title: "In Groups", dataIndex: "inGroups", key: "inGroups" },
    { title: "Without Groups", dataIndex: "withoutGroups", key: "withoutGroups" },
  ];

  const studentsByClassColumns = [
    { title: "Class", dataIndex: "className", key: "className" },
    { title: "Semester", dataIndex: "semesterName", key: "semesterName" },
    { title: "Students", dataIndex: "studentCount", key: "studentCount" },
    { title: "Groups", dataIndex: "groupCount", key: "groupCount" },
    { title: "Avg Group Size", dataIndex: "averageGroupSize", key: "averageGroupSize", render: (val: number) => val?.toFixed(1) },
  ];

  const projectsBySemesterColumns = [
    { title: "Semester", dataIndex: "semesterName", key: "semesterName" },
    { title: "Total", dataIndex: "totalProjects", key: "totalProjects" },
    { title: "Completed", dataIndex: "completed", key: "completed" },
    { title: "In Progress", dataIndex: "inProgress", key: "inProgress" },
    { title: "Pending", dataIndex: "pending", key: "pending" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>
          <FileText className="w-8 h-8 inline-block mr-2 text-blue-600" />
          Reports
        </Title>
        <div className="flex items-center gap-3">
          <Select
            placeholder="All Semesters"
            style={{ width: 300 }}
            value={selectedSemester}
            onChange={setSelectedSemester}
            allowClear
            options={semesters.map((s) => ({
              label: `${s.name} (${s.year} - ${s.term})`,
              value: s.semesterId,
            }))}
          />
          <Button
            type="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportReport}
            loading={exporting}
            disabled={!selectedSemester}
          >
            Export Report
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Instructors Workload" key="instructors">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          ) : instructorsReport ? (
            <>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Total Instructors"
                      value={instructorsReport.totalInstructors}
                      prefix={<Users className="w-5 h-5" />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Avg Classes/Instructor"
                      value={instructorsReport.averageClassesPerInstructor}
                      precision={1}
                      prefix={<BookOpen className="w-5 h-5" />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Without Classes"
                      value={instructorsReport.instructorsWithNoClasses}
                      prefix={<Users className="w-5 h-5" />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Card>
                <Table
                  dataSource={instructorsReport.instructorWorkloads}
                  columns={instructorColumns}
                  rowKey="instructorId"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </>
          ) : (
            <Empty />
          )}
        </TabPane>

        <TabPane tab="Students Distribution" key="students">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          ) : studentsReport ? (
            <>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="Total Students"
                      value={studentsReport.totalStudents}
                      prefix={<Users className="w-5 h-5" />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card>
                    <Statistic
                      title="In Groups"
                      value={studentsReport.studentsInGroups}
                      prefix={<Users className="w-5 h-5" />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                 <Card>
                    <Statistic
                      title="In Groups"
                      value={studentsReport.studentsWithoutGroups}
                      prefix={<Users className="w-5 h-5" />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="Students by Semester">
                    <Table
                      dataSource={studentsReport.studentsBySemester}
                      columns={studentsBySemesterColumns}
                      rowKey="semesterId"
                      pagination={false}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Students by Class">
                    <Table
                      dataSource={studentsReport.studentsByClass}
                      columns={studentsByClassColumns}
                      rowKey="classId"
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Empty />
          )}
        </TabPane>

        <TabPane tab="Projects Status" key="projects">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          ) : projectsReport ? (
            <>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Total Projects"
                      value={projectsReport.totalProjects}
                      prefix={<FolderOpen className="w-5 h-5" />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Approved"
                      value={projectsReport.approvedProjects}
                      prefix={<FolderOpen className="w-5 h-5" />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Completed"
                      value={projectsReport.completedProjects}
                      prefix={<FolderOpen className="w-5 h-5" />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Rejected"
                      value={projectsReport.rejectedProjects}
                      prefix={<FolderOpen className="w-5 h-5" />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="Projects by Status">
                    <Table
                      dataSource={projectsReport.projectsByStatus}
                      columns={[
                        { title: "Status", dataIndex: "status", key: "status" },
                        { title: "Count", dataIndex: "count", key: "count" },
                        { 
                          title: "Percentage", 
                          dataIndex: "percentage", 
                          key: "percentage",
                          render: (val: number) => <Tag color="blue">{val.toFixed(1)}%</Tag>
                        },
                      ]}
                      rowKey="status"
                      pagination={false}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Projects by Semester">
                    <Table
                      dataSource={projectsReport.projectsBySemester}
                      columns={projectsBySemesterColumns}
                      rowKey="semesterId"
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Empty />
          )}
        </TabPane>

        <TabPane tab="Milestone Progress" key="milestones">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          ) : milestonesReport ? (
            <>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Total Milestones"
                      value={milestonesReport.totalMilestones}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Completed"
                      value={milestonesReport.completedMilestones}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Completion Rate"
                      value={milestonesReport.overallCompletionRate}
                      precision={1}
                      suffix="%"
                      prefix={<TrendingUp className="w-5 h-5" />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Average Grade"
                      value={milestonesReport.averageGrade}
                      precision={2}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Card title="Milestone Completion by Semester">
                <Table
                  dataSource={selectedSemester 
                    ? milestonesReport.completionBySemester.filter(s => s.semesterId === selectedSemester)
                    : milestonesReport.completionBySemester
                  }
                  columns={[
                    { 
                      title: "Semester", 
                      dataIndex: "semesterName", 
                      key: "semesterName",
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    { 
                      title: "Total Milestones", 
                      dataIndex: "totalMilestones", 
                      key: "totalMilestones",
                      render: (val: number) => <Tag color="blue">{val}</Tag>
                    },
                    { 
                      title: "Completed", 
                      dataIndex: "completed", 
                      key: "completed",
                      render: (val: number) => <Tag color="green">{val}</Tag>
                    },
                    { 
                      title: "Completion Rate", 
                      dataIndex: "completionRate", 
                      key: "completionRate",
                      render: (val: number) => (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className="font-medium min-w-[50px]">{val.toFixed(1)}%</span>
                        </div>
                      ),
                    },
                  ]}
                  rowKey="semesterId"
                  pagination={false}
                />
              </Card>
            </>
          ) : (
            <Empty />
          )}
        </TabPane>

        <TabPane tab="Grades Distribution" key="grades">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spin size="large" />
            </div>
          ) : gradesReport ? (
            <>
              <Row gutter={16} className="mb-6">
                <Col xs={24} sm={8} md={6}>
                  <Card>
                    <Statistic
                      title="Graded Projects"
                      value={gradesReport.totalGradedProjects}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Card>
                    <Statistic
                      title="Average Grade"
                      value={gradesReport.averageGrade}
                      precision={2}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Card>
                    <Statistic
                      title="Highest Grade"
                      value={gradesReport.highestGrade}
                      precision={2}
                      prefix={<TrendingUp className="w-5 h-5" />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Card>
                    <Statistic
                      title="Lowest Grade"
                      value={gradesReport.lowestGrade}
                      precision={2}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Card>
                    <Statistic
                      title="Median Grade"
                      value={gradesReport.medianGrade}
                      precision={2}
                      prefix={<Award className="w-5 h-5" />}
                      valueStyle={{ color: "#fa8c16" }}
                    />
                  </Card>
                </Col>
              </Row>
              <Card title="Grade Distribution by Ranges">
                <Table
                  dataSource={gradesReport.gradeRanges}
                  columns={[
                    { 
                      title: "Grade Range", 
                      dataIndex: "range", 
                      key: "range",
                      render: (text: string) => <span className="font-medium">{text}</span>
                    },
                    { 
                      title: "Count", 
                      dataIndex: "count", 
                      key: "count",
                      sorter: (a: any, b: any) => b.count - a.count,
                      render: (val: number) => <Tag color="blue">{val}</Tag>
                    },
                    { 
                      title: "Percentage", 
                      dataIndex: "percentage", 
                      key: "percentage",
                      render: (val: number) => (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className="font-medium min-w-[50px]">{val.toFixed(1)}%</span>
                        </div>
                      ),
                    },
                  ]}
                  rowKey="range"
                  pagination={false}
                />
              </Card>
            </>
          ) : (
            <Empty />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
