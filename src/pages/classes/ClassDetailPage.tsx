import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  List,
  Skeleton,
  Empty,
  Button,
  Statistic,
  Modal,
  Radio,
  Select,
  InputNumber,
  Popconfirm,
  Space,
  Divider,
  Typography,
  Upload,
  Table,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getClassDetail } from "../../api/classes";
import type { ClassDetail } from "../../types/classes";
import dayjs from "dayjs";
import {
  Users,
  FolderOpen,
  ArrowLeft,
  GraduationCap,
  UserCheck,
  LayoutGrid,
  Package,
  UserPlus,
  UserMinus,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import {
  addStudentToClass,
  bulkAddStudents,
  removeStudentFromClass,
  importStudentsToClass,
} from "../../api/admin";
import { getUsersByRole } from "../../api/users";
import { ROLES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/helpers";
import type { ImportStudentsResult } from "../../types/admin";

const { Paragraph, Text } = Typography;

const PRIMARY_COLOR = "blue";
const ICON_SIZE = 18;

type AddMode = "select" | "auto" | "import";

type UserItem = {
  userId: number | string;
  fullName: string;
  email: string;
  phone: string | null;
  roleId: number | string | null;
  avatarUrl: string | null;
};

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("select");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [studentsPool, setStudentsPool] = useState<UserItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<
    (number | string)[]
  >([]);
  const [autoMaxMembers, setAutoMaxMembers] = useState<number>(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportStudentsResult | null>(
    null,
  );
  const [showImportResult, setShowImportResult] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getClassDetail(Number(id));
      setDetail(res.data ?? null);
    } catch (e: any) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const searchStudents = async (keyword: string) => {
    if (!keyword || keyword.trim().length < 2) {
      setStudentsPool([]);
      return;
    }

    try {
      setLoadingUsers(true);
      const res = await getUsersByRole(3);
      const list = res?.data ?? [];

      const filtered = list.filter((student: UserItem) => {
        const searchLower = keyword.toLowerCase().trim();
        return (
          student.fullName?.toLowerCase().includes(searchLower) ||
          student.email?.toLowerCase().includes(searchLower)
        );
      });

      setStudentsPool(filtered);
    } catch (e: any) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchStudents(value);
    }, 500);

    setSearchTimeout(timeout);
  };

  if (loading || !detail) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  type StatItemProps = {
    title: React.ReactNode;
    value?: number | string;
    icon?: React.ReactElement;
    color?: string;
  };

  const StatItem = ({ title, value, icon, color }: StatItemProps) => (
    <Col xs={24} sm={8} lg={24} xl={8}>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <Statistic
          title={
            <div className="flex items-center text-gray-500">
              {icon &&
                React.isValidElement(icon) &&
                React.cloneElement(icon as React.ReactElement<any>, {
                  size: 16,
                  className: `mr-2 text-${color}-500`,
                })}
              {title}
            </div>
          }
          value={value}
          valueStyle={{ color: `#3f8600`, fontWeight: 600 }}
        />
      </Card>
    </Col>
  );

  const isAdmin = user?.roleName && user.roleName === ROLES?.ADMIN;

  const openAddModal = () => {
    setSelectedStudentIds([]);
    setAutoMaxMembers(0);
    setAddMode("select");
    setFileList([]);
    setImportResult(null);
    setShowImportResult(false);
    setSearchValue("");
    setStudentsPool([]);
    setAddModalOpen(true);
  };

  const handleAddStudent = async () => {
    if (!detail || !id) return;
    setSubmittingAdd(true);
    try {
      if (addMode === "import") {
        if (fileList.length === 0) {
          toast.error("Please select an Excel file");
          return;
        }

        const file = fileList[0].originFileObj;
        const res = await importStudentsToClass(Number(id), file);

        if (!res.isSuccess || !res.data) {
          toast.error(res.message || "Import failed");
          return;
        }

        setImportResult(res.data);
        setShowImportResult(true);

        if (res.data.successCount > 0) {
          toast.success(
            `Successfully imported ${res.data.successCount} students`,
          );
          await fetchDetail();
        }

        if (res.data.failedCount > 0) {
          toast(`${res.data.failedCount} students failed to import`, {
            icon: "⚠️",
            style: {
              background: "#FFA500",
              color: "#fff",
            },
          });
        }

        return;
      }

      if (addMode === "select") {
        if (!selectedStudentIds || selectedStudentIds.length === 0) {
          toast.error("Please select at least one student to add.");
          return;
        }

        let successCount = 0;
        let failCount = 0;
        const addedStudents: any[] = [];

        for (const studentId of selectedStudentIds) {
          try {
            await addStudentToClass(Number(id), {
              studentId: Number(studentId),
            });

            const picked = studentsPool.find(
              (u) => String(u.userId) === String(studentId),
            );
            const newStudent = picked
              ? {
                  userId: picked.userId,
                  fullName: picked.fullName,
                  email: picked.email,
                  enrolledAt: new Date().toISOString(),
                }
              : {
                  userId: studentId,
                  fullName: "New Student",
                  email: "",
                  enrolledAt: new Date().toISOString(),
                };
            addedStudents.push(newStudent);
            successCount++;
          } catch (e: any) {
            failCount++;
            console.error(`Failed to add student ${studentId}:`, e);
            toast.error(e?.response?.data?.message || "Failed to add student");
          }
        }

        if (addedStudents.length > 0) {
          setDetail((prev) =>
            prev
              ? {
                  ...prev,
                  totalStudents:
                    (prev.totalStudents ?? 0) + addedStudents.length,
                  students: [...addedStudents, ...prev.students],
                }
              : prev,
          );
          setStudentsPool((prev) =>
            prev.filter(
              (u) =>
                !selectedStudentIds.some(
                  (id) => String(id) === String(u.userId),
                ),
            ),
          );
        }

        if (successCount > 0) {
          toast.success(
            `Successfully added ${successCount} student${successCount > 1 ? "s" : ""} to class.`,
          );
        }
        if (failCount > 0) {
          toast.error(
            `Failed to add ${failCount} student${failCount > 1 ? "s" : ""}.`,
          );
        }
        
        setSelectedStudentIds([]);
        setSearchValue("");
      } else {
        const res = await bulkAddStudents({
          classId: Number(id),
          maxMembers: autoMaxMembers,
        });
        const addedList =
          (res?.data as any)?.addedStudents ||
          (res?.data as any)?.students ||
          [];
        if (Array.isArray(addedList) && addedList.length) {
          const mapped = addedList.map((s: any) => ({
            userId: s.userId ?? s.id,
            fullName: s.fullName ?? s.name ?? "New Student",
            email: s.email ?? "",
            enrolledAt: s.enrolledAt ?? new Date().toISOString(),
          }));
          setDetail((prev) =>
            prev
              ? {
                  ...prev,
                  totalStudents: (prev.totalStudents ?? 0) + mapped.length,
                  students: [...mapped, ...prev.students],
                }
              : prev,
          );
          setStudentsPool((prev) =>
            prev.filter(
              (u) =>
                !mapped.some((m: any) => String(m.userId) === String(u.userId)),
            ),
          );
        } else {
          setDetail((prev) =>
            prev
              ? {
                  ...prev,
                  totalStudents:
                    autoMaxMembers > (prev.totalStudents ?? 0)
                      ? autoMaxMembers
                      : prev.totalStudents,
                }
              : prev,
          );
        }
        toast.success("Students automatically added to class.");
      }
      setAddModalOpen(false);
    } catch (e: any) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!id) return;
    try {
      setRemovingId(studentId);
      await removeStudentFromClass(Number(id), studentId);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              totalStudents: Math.max(0, (prev.totalStudents ?? 0) - 1),
              students: prev.students.filter(
                (s: any) => Number(s.userId) !== Number(studentId),
              ),
            }
          : prev,
      );
      toast.success("Student removed from class successfully.");
    } catch (e: any) {
      toast.error(getErrorMessage(e));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Button
        type="default"
        icon={<ArrowLeft size={ICON_SIZE} />}
        onClick={() => navigate(-1)}
        className="font-medium mb-important"
      >
        Back
      </Button>

      <Card
        className="shadow-sm border-t-4 border-t-blue-500"
        title={
          <div className="flex items-center gap-3 py-2">
            <FolderOpen size={24} className={`text-${PRIMARY_COLOR}-600`} />
            <span className="text-xl font-bold text-gray-800">
              {detail.className}
            </span>
          </div>
        }
        extra={
          isAdmin ? (
            <Button
              type="primary"
              icon={<UserPlus size={16} />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
          ) : null
        }
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} lg={16}>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              General Information
            </h3>

            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              size="middle"
            >
              <Descriptions.Item label="Instructor" span={3}>
                <span className="font-medium text-gray-700">
                  {detail.instructorName ?? "—"}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Semester" span={1}>
                <span className="font-medium text-gray-700">
                  {detail.semesterName ?? "—"}
                </span>
                {detail.semesterCode && (
                  <Tag color={PRIMARY_COLOR} className="ml-2 font-semibold">
                    {detail.semesterCode}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date" span={1}>
                {dayjs(detail.createdAt).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                <p className="text-gray-600 italic whitespace-pre-wrap">
                  {detail.description || "No description"}
                </p>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} lg={8} className="lg:pl-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Class Statistics
            </h3>
            <Row gutter={[16, 16]}>
              <StatItem
                title="Students"
                value={detail.totalStudents}
                icon={<GraduationCap />}
                color="green"
              />
              <StatItem
                title="Groups"
                value={detail.totalGroups}
                icon={<LayoutGrid />}
                color="orange"
              />
              <StatItem
                title="Projects"
                value={detail.totalProjects}
                icon={<Package />}
                color="purple"
              />
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <LayoutGrid
                  size={ICON_SIZE}
                  className={`text-${PRIMARY_COLOR}-500`}
                />
                <span>Group List ({detail.groups.length})</span>
              </div>
            }
          >
            {detail.groups.length === 0 ? (
              <Empty
                description="No groups yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={detail.groups}
                itemLayout="horizontal"
                pagination={{ pageSize: 5 }}
                renderItem={(g) => (
                  <List.Item className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer p-2 rounded-lg item-lists">
                    <List.Item.Meta
                      title={
                        <span className="font-semibold text-base text-blue-700">
                          {g.groupName}
                        </span>
                      }
                      description={
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                          <p className="flex items-center">
                            <UserCheck
                              size={14}
                              className="mr-1 text-orange-500"
                            />
                            <strong>Leader:</strong>&nbsp;
                            {g.leaderName ?? "—"}
                          </p>
                          <div className="flex gap-4">
                            <Tag color="cyan">Members: {g.memberCount}</Tag>
                            <Tag color="magenta">
                              Projects: {g.projectCount}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
                <Users
                  size={ICON_SIZE}
                  className={`text-${PRIMARY_COLOR}-500`}
                />
                <span>Student List ({detail.students.length})</span>
              </div>
            }
          >
            {detail.students.length === 0 ? (
              <Empty
                description="No students yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={detail.students}
                itemLayout="horizontal"
                pagination={{ pageSize: 5 }}
                renderItem={(s) => (
                  <List.Item
                    className="hover:bg-gray-50 transition-colors duration-200 p-2 pl-10 rounded-lg item-lists"
                    actions={
                      isAdmin
                        ? [
                            <Popconfirm
                              key="remove"
                              title="Remove Student"
                              description={`Are you sure you want to remove ${s.fullName} from this class?`}
                              okText="Remove"
                              cancelText="Cancel"
                              onConfirm={() =>
                                handleRemoveStudent(Number(s.userId))
                              }
                            >
                              <Button
                                type="text"
                                danger
                                icon={<UserMinus size={16} />}
                                loading={removingId === Number(s.userId)}
                              >
                                Remove
                              </Button>
                            </Popconfirm>,
                          ]
                        : []
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <GraduationCap size={24} className="text-gray-500" />
                      }
                      title={
                        <span className="font-semibold text-base">
                          {s.fullName}
                        </span>
                      }
                      description={
                        <div className="text-sm text-gray-500">
                          <p>{s.email}</p>
                          <Tag className="mt-1" color="default">
                            Enrolled: {dayjs(s.enrolledAt).format("DD/MM/YYYY")}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserPlus size={18} /> Add Student to Class
          </div>
        }
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setShowImportResult(false);
        }}
        onOk={handleAddStudent}
        okText={
          addMode === "select"
            ? "Add Student"
            : addMode === "auto"
              ? "Auto Fill"
              : "Import"
        }
        confirmLoading={submittingAdd}
        destroyOnClose
        width={showImportResult ? 900 : 600}
        style={{ top: 20 }}
      >
        {showImportResult && importResult ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Import Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Rows:</span>
                  <span className="ml-2 font-semibold">
                    {importResult.totalRows}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Success:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {importResult.successCount}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Failed:</span>
                  <span className="ml-2 font-semibold text-red-600">
                    {importResult.failedCount}
                  </span>
                </div>
              </div>
            </div>

            {importResult.successfulStudents.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">
                  Successful Imports
                </h4>
                <Table
                  dataSource={importResult.successfulStudents}
                  rowKey="rowNumber"
                  size="small"
                  pagination={false}
                  scroll={{ y: 200 }}
                  columns={[
                    {
                      title: "Row",
                      dataIndex: "rowNumber",
                      key: "rowNumber",
                      width: 60,
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                    },
                    {
                      title: "Student Name",
                      dataIndex: "studentName",
                      key: "studentName",
                    },
                    {
                      title: "Status",
                      key: "status",
                      width: 100,
                      render: () => <Tag color="green">Passed</Tag>,
                    },
                  ]}
                />
              </div>
            )}

            {importResult.failedStudents.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">
                  Failed Imports
                </h4>
                <Table
                  dataSource={importResult.failedStudents}
                  rowKey="rowNumber"
                  size="small"
                  pagination={false}
                  scroll={{ y: 200 }}
                  columns={[
                    {
                      title: "Row",
                      dataIndex: "rowNumber",
                      key: "rowNumber",
                      width: 60,
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      width: 120,
                      render: (status) => <Tag color="red">{status}</Tag>,
                    },
                    {
                      title: "Reason",
                      dataIndex: "reason",
                      key: "reason",
                    },
                  ]}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={() => {
                  setAddModalOpen(false);
                  setShowImportResult(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Radio.Group
              value={addMode}
              onChange={(e) => setAddMode(e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="select">
                  <div className="flex flex-col">
                    <Text strong>Add Specific Member</Text>
                    <Paragraph type="secondary" className="mb-1">
                      Select a specific student to add to the current class.
                    </Paragraph>
                  </div>
                </Radio>
                <Radio value="auto">
                  <div className="flex flex-col">
                    <Text strong>Auto Fill to Capacity</Text>
                    <Paragraph type="secondary" className="mb-1">
                      The system will automatically add students to the class
                      until the maximum number you set below is reached.
                    </Paragraph>
                  </div>
                </Radio>
                <Radio value="import">
                  <div className="flex flex-col">
                    <Text strong>Import from Excel</Text>
                    <Paragraph type="secondary" className="mb-1">
                      Upload an Excel file containing student email addresses to
                      import multiple students at once.
                    </Paragraph>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>

            <Divider className="my-2" />

            {addMode === "select" ? (
              <div className="space-y-4">
                <div>
                  <Text strong className="text-base mb-2 block">
                    Select Students
                  </Text>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Type to search by name or email (min 2 characters)..."
                    filterOption={false}
                    loading={loadingUsers}
                    value={selectedStudentIds}
                    onChange={(val) => setSelectedStudentIds(val)}
                    onSearch={handleSearchChange}
                    searchValue={searchValue}
                    className="w-full"
                    size="large"
                    options={(studentsPool ?? []).map((u) => ({
                      value: u.userId,
                      label: `${u.fullName} — ${u.email}`,
                    }))}
                    notFoundContent={
                      loadingUsers
                        ? "Searching..."
                        : searchValue.length < 2
                          ? "Type at least 2 characters to search"
                          : "No students found"
                    }
                    maxTagCount={0}
                    maxTagPlaceholder={(omittedValues) => (
                      <div className="flex items-center gap-1.5 px-2 py-0.5  text-blue-700 rounded">
                        <Users size={14} />
                        <span className="font-medium">
                          {omittedValues.length} selected
                        </span>
                      </div>
                    )}
                  />
                </div>

                {selectedStudentIds.length > 0 && (
                  <div className="border-2 border-blue-100 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <Text strong className="text-base text-gray-800">
                            Selected Students
                          </Text>
                          <div className="text-xs text-gray-500">
                            {selectedStudentIds.length} student
                            {selectedStudentIds.length > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        danger
                        ghost
                        onClick={() => setSelectedStudentIds([])}
                        className="font-medium"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedStudentIds.map((id, index) => {
                        const student = studentsPool.find(
                          (u) => String(u.userId) === String(id),
                        );
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                              <GraduationCap
                                size={16}
                                className="text-blue-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-800 truncate">
                                {index + 1}.{" "}
                                {student?.fullName || "Unknown Student"}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {student?.email || "No email"}
                              </div>
                            </div>
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<UserMinus size={16} />}
                              onClick={() =>
                                setSelectedStudentIds((prev) =>
                                  prev.filter((sid) => sid !== id),
                                )
                              }
                              className="flex-shrink-0 hover:bg-red-50"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : addMode === "auto" ? (
              <div className="space-y-1">
                <Text>Maximum Capacity to Reach</Text>
                <InputNumber
                  className="w-full"
                  min={1}
                  value={autoMaxMembers}
                  onChange={(v) => setAutoMaxMembers(Number(v || 0))}
                  placeholder="Enter maximum class capacity (e.g., 30)"
                />
                <Paragraph type="secondary" className="mt-1">
                  The system will automatically add new students (not already in
                  class) until the class reaches{" "}
                  <Text strong>{autoMaxMembers || 0}</Text> members (or until no
                  more eligible candidates are available).
                </Paragraph>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Excel Format Required:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-3 py-2">
                            student@fpt.edu.vn
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2">
                            student@example.com
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Note:</strong> The Excel file must contain an
                    "Email" column with student email addresses. Only existing
                    students in the system can be added.
                  </p>
                </div>

                <Upload.Dragger
                  fileList={fileList}
                  beforeUpload={(file: File) => {
                    const isExcel =
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      file.type === "application/vnd.ms-excel";
                    if (!isExcel) {
                      toast.error("You can only upload Excel files!");
                      return false;
                    }
                    setFileList([
                      {
                        ...file,
                        uid: file.name,
                        name: file.name,
                        originFileObj: file,
                      },
                    ]);
                    return false;
                  }}
                  onRemove={() => {
                    setFileList([]);
                  }}
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <FileSpreadsheet
                      size={48}
                      className="mx-auto text-gray-400"
                    />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag Excel file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for single Excel file upload only (.xlsx or .xls)
                  </p>
                </Upload.Dragger>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
