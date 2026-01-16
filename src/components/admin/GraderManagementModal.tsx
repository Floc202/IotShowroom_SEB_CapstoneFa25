import { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Button,
  Tag,
  Spin,
  Select,
  Card,
  Empty,
  Popconfirm,
  Switch,
  Row,
  Col,
  Statistic,
  Alert,
} from "antd";
import { UserPlus, Trash2, BarChart3 } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import {
  getClassGraders,
  assignGrader,
  bulkAssignGraders,
  removeGrader,
  updateGraderStatus,
  getGradingStatistics,
} from "../../api/admin";
import type { GraderAssignment, GradingStatistics } from "../../types/admin";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { getUsersByRole } from "../../api/users";
import type { UserItem } from "../../types/users";

interface GraderManagementModalProps {
  open: boolean;
  classId: number;
  className: string;
  instructorId: number | null;
  onClose: () => void;
}

export default function GraderManagementModal({
  open,
  classId,
  className,
  instructorId,
  onClose,
}: GraderManagementModalProps) {
  const [graders, setGraders] = useState<GraderAssignment[]>([]);
  const [statistics, setStatistics] = useState<GradingStatistics | null>(null);
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [instructors, setInstructors] = useState<UserItem[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      fetchInstructors();
    }
  }, [open, classId]);

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const res = await getUsersByRole(2);
      if (res.isSuccess && res.data) {
        const filteredInstructors = res.data.filter(
          (instructor) => instructor.userId !== instructorId
        );
        setInstructors(filteredInstructors);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingInstructors(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradersRes, statsRes] = await Promise.all([
        getClassGraders(classId),
        getGradingStatistics(classId),
      ]);

      if (gradersRes.isSuccess && gradersRes.data) {
        setGraders(gradersRes.data);
      }

      if (statsRes.isSuccess && statsRes.data) {
        setStatistics(statsRes.data);
      }

    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignGraders = async () => {
    if (selectedInstructors.length === 0) {
      toast.error("Please select at least one instructor");
      return;
    }

    try {
      setAssigning(true);
      if (selectedInstructors.length === 1) {
        const res = await assignGrader({
          classId,
          instructorId: selectedInstructors[0],
        });
        if (res.isSuccess) {
          toast.success("Grader assigned successfully");
          setSelectedInstructors([]);
          fetchData();
        }
      } else {
        const res = await bulkAssignGraders({
          classId,
          instructorIds: selectedInstructors,
        });
        if (res.isSuccess) {
          toast.success(
            `${selectedInstructors.length} graders assigned successfully`
          );
          setSelectedInstructors([]);
          fetchData();
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveGrader = async (graderId: number) => {
    try {
      const res = await removeGrader(graderId);
      if (res.isSuccess) {
        toast.success("Grader removed successfully");
        fetchData();
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleToggleStatus = async (grader: GraderAssignment) => {
    try {
      const res = await updateGraderStatus(grader.graderId, {
        isActive: !grader.isActive,
      });
      if (res.isSuccess) {
        toast.success(
          `Grader ${
            res.data?.isActive ? "activated" : "deactivated"
          } successfully`
        );
        fetchData();
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const columns: ColumnsType<GraderAssignment> = [
    {
      title: "Instructor",
      key: "instructor",
      render: (_: any, record: GraderAssignment) => (
        <div>
          <div className="font-medium">{record.instructorName}</div>
          <div className="text-xs text-gray-500">{record.instructorEmail}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean, record: GraderAssignment) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: "Final Submissions",
      dataIndex: "totalFinalSubmissions",
      key: "totalFinalSubmissions",
      width: 120,
      align: "center" as const,
    },
    {
      title: "Graded",
      dataIndex: "gradedByThisInstructor",
      key: "gradedByThisInstructor",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Pending",
      dataIndex: "pendingGrades",
      key: "pendingGrades",
      width: 100,
      align: "center" as const,
      render: (pending: number) => (
        <Tag color={pending > 0 ? "orange" : "green"}>{pending}</Tag>
      ),
    },
    {
      title: "Assigned At",
      dataIndex: "assignedAt",
      key: "assignedAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: GraderAssignment) => (
        <Popconfirm
          title="Remove Grader"
          description="Are you sure you want to remove this grader?"
          onConfirm={() => handleRemoveGrader(record.graderId)}
          okText="Remove"
          okType="danger"
          cancelText="Cancel"
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 className="w-4 h-4" />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={`Grading Configuration - ${className}`}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
      bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      style={{ top: "10px" }}
    >
      <Spin spinning={loading}>
        <div className="space-y-6">
          {statistics && (
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Total Graders"
                    value={statistics.totalAssignedGraders}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Active Graders"
                    value={statistics.activeGraders}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Grading Progress"
                    value={statistics.gradingCompletionPercentage}
                    suffix="%"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Avg Grade"
                    value={
                      statistics.averageGrade
                        ? statistics.averageGrade.toFixed(2)
                        : "N/A"
                    }
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Col>
              </Row>
            </Card>
          )}

          <Card title="Assign Graders">
            <div className="space-y-4">
              <Alert
                message="Select instructors from your institution to assign as graders for this class"
                type="info"
                showIcon
              />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Select Instructors
                </label>
                <Select
                  mode="multiple"
                  placeholder="Choose instructors..."
                  value={selectedInstructors}
                  onChange={setSelectedInstructors}
                  loading={loadingInstructors}
                  options={instructors.map((instructor) => ({
                    label: instructor.fullName,
                    value: instructor.userId,
                  }))}
                  className="w-full"
                  optionFilterProp="label"
                  showSearch
                />
              </div>
              <Button
                type="primary"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={handleAssignGraders}
                loading={assigning}
                block
              >
                Assign Selected Instructors
              </Button>
            </div>
          </Card>

          <Card title={`Current Graders (${graders.length})`}>
            {graders.length > 0 ? (
              <Table<GraderAssignment>
                rowKey="graderId"
                columns={columns}
                dataSource={graders}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="No graders assigned yet" />
            )}
          </Card>

          {statistics && statistics.graderWorkloads.length > 0 && (
            <Card
              title="Grader Workload Details"
              extra={<BarChart3 className="w-4 h-4 text-gray-400" />}
            >
              <div className="space-y-4">
                {statistics.graderWorkloads.map((workload) => (
                  <Card key={workload.instructorId} className="bg-gray-50">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div>
                          <div className="font-medium">
                            {workload.instructorName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {workload.instructorEmail}
                          </div>
                          <Tag
                            color={workload.isActive ? "green" : "red"}
                            className="mt-2"
                          >
                            {workload.isActive ? "Active" : "Inactive"}
                          </Tag>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Statistic
                              title="Assigned"
                              value={workload.totalAssignedSubmissions}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Graded"
                              value={workload.gradedCount}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Pending"
                              value={workload.pendingCount}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Completion"
                              value={workload.completionPercentage}
                              suffix="%"
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Spin>
    </Modal>
  );
}
