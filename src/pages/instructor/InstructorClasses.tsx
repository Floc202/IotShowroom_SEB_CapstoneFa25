import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tag, Empty, Input, Button, Row, Col, Select, Table, Space, Modal } from "antd";
import { GraduationCap, Search, Eye, Users, FolderKanban, Calendar, Download, FileSpreadsheet, Clock } from "lucide-react";
import { getInstructorClasses, getClassGrades, exportClassGrades } from "../../api/instructor";
import type { InstructorClassItem, ClassGrades } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage, formatVietnamTime } from "../../utils/helpers";

export default function InstructorClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<InstructorClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<InstructorClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [gradesData, setGradesData] = useState<ClassGrades | null>(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getInstructorClasses();
      if (res.isSuccess && res.data) {
        setClasses(res.data);
        setFilteredClasses(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(
      (cls) =>
        cls.className.toLowerCase().includes(searchText.toLowerCase()) ||
        cls.semesterName.toLowerCase().includes(searchText.toLowerCase()) ||
        cls.semesterCode.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredClasses(filtered);
  }, [searchText, classes]);

  const handleFetchGrades = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class first");
      return;
    }
    try {
      setLoadingGrades(true);
      const res = await getClassGrades(selectedClassId);
      if (res.isSuccess && res.data) {
        setGradesData(res.data);
        setGradesModalOpen(true);
        toast.success("Grades retrieved successfully");
      } else {
        toast.error(res.message || "Failed to retrieve grades");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingGrades(false);
    }
  };

  const handleExportGrades = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class first");
      return;
    }
    try {
      setExporting(true);
      const { blob, headers } = await exportClassGrades(selectedClassId, true, false);
      
      const contentDisposition = headers["content-disposition"] || headers["Content-Disposition"] || "";
      let fileName = "";
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, "");
          if (fileName.startsWith("UTF-8''")) {
            fileName = decodeURIComponent(fileName.substring(7));
          }
        }
      }
      
      if (!fileName) {
        const selectedClass = classes.find(c => c.classId === selectedClassId);
        fileName = selectedClass 
          ? `ClassGrades_${selectedClass.className}_${new Date().toISOString().split('T')[0]}.xlsx`
          : `ClassGrades_${selectedClassId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel file exported successfully");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const gradeColumns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      width: 150,
      render: (text: string | null) => text || "-",
    },
    {
      title: "Project Title",
      dataIndex: "projectTitle",
      key: "projectTitle",
      width: 200,
      render: (text: string | null) => text || "-",
    },
    ...(gradesData?.milestoneNames.map((milestone) => ({
      title: milestone,
      key: milestone,
      dataIndex: ["milestoneGrades", milestone],
      width: 120,
      render: (value: number | null) => value !== null ? value.toFixed(2) : "-",
    })) || []),
    {
      title: "Overall Grade",
      dataIndex: "overallGrade",
      key: "overallGrade",
      width: 100,
      render: (value: number | null) => value !== null ? value.toFixed(2) : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          "Approved": "green",
          "No Project": "default",
          "Pending": "orange",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-7 h-7" />
          My Classes
        </h1>
        <p className="text-gray-600">Manage your assigned classes</p>
      </div>

      <Card title="Grade Management" className="mb-6">
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
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={handleFetchGrades}
            loading={loadingGrades}
            disabled={!selectedClassId}
          >
            Get Grades
          </Button>
          <Button
            type="default"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportGrades}
            loading={exporting}
            disabled={!selectedClassId || !gradesData}
          >
            Export Excel
          </Button>
        </Space>
      </Card>

      <Modal
        title="Class Grades"
        open={gradesModalOpen}
        onCancel={() => setGradesModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setGradesModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportGrades}
            loading={exporting}
            disabled={!gradesData}
          >
            Export Excel
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
      >
        {gradesData && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-sm text-gray-600">Class Name</div>
                  <div className="font-semibold">{gradesData.className}</div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-600">Semester</div>
                  <div className="font-semibold">{gradesData.semesterName}</div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-600">Total Students</div>
                  <div className="font-semibold">{gradesData.totalStudents}</div>
                </Col>
                <Col span={6}>
                  <div className="text-sm text-gray-600">Total Groups</div>
                  <div className="font-semibold">{gradesData.totalGroups}</div>
                </Col>
              </Row>
            </div>
            <Table
              columns={gradeColumns}
              dataSource={gradesData.studentGrades.map((grade, index) => ({
                ...grade,
                key: grade.studentId || index,
              }))}
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
            />
          </div>
        )}
      </Modal>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search by class name, semester..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} loading={true} />
            ))}
          </div>
        ) : filteredClasses.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredClasses.map((cls) => (
              <Col xs={24} sm={12} lg={8} key={cls.classId}>
                <Card
                  hoverable
                  className="h-full transition-shadow hover:shadow-lg"
                  onClick={() => navigate(`/instructor/classes/${cls.classId}`)}
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<Eye className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/instructor/classes/${cls.classId}`);
                      }}
                    >
                      View
                    </Button>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold truncate">{cls.className}</span>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{cls.semesterName}</span>
                      <Tag color="blue" className="ml-auto">{cls.semesterCode}</Tag>
                    </div>

                    {cls.startTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatVietnamTime(cls.startTime, "DD/MM/YYYY HH:mm")}</span>
                      </div>
                    )}

                    {cls.status && (
                      <div className="flex items-center gap-2">
                        <Tag color={
                          cls.status === 'Not Started' ? 'default' : 
                          cls.status === 'In Progress' ? 'orange' : 
                          cls.status === 'Completed' ? 'green' : 'default'
                        }>
                          {cls.status}
                        </Tag>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-xs text-gray-500">Students</div>
                        <div className="font-semibold text-blue-600">{cls.totalStudents}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-xs text-gray-500">Groups</div>
                        <div className="font-semibold text-green-600">{cls.totalGroups}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FolderKanban className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-xs text-gray-500">Projects</div>
                        <div className="font-semibold text-purple-600">{cls.totalProjects}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 pt-2 border-t">
                      Created: {formatVietnamTime(cls.createdAt, "DD/MM/YYYY")}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description={searchText ? "No classes found" : "No classes assigned"} />
        )}
      </Card>
    </div>
  );
}
