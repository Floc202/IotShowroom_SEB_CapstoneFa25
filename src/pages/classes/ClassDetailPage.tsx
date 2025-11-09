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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../providers/AuthProvider";
import {
  addStudentToClass,
  bulkAddStudents,
  removeStudentFromClass,
} from "../../api/admin";
import { getUsersByRole } from "../../api/users";
import { ROLES } from "../../utils/constants";
import { getErrorMessage } from "../../utils/helpers";

const { Paragraph, Text } = Typography;

const PRIMARY_COLOR = "blue";
const ICON_SIZE = 18;

type AddMode = "select" | "auto";

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
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | string | null
  >(null);
  const [autoMaxMembers, setAutoMaxMembers] = useState<number>(0);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

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

  useEffect(() => {
    const needLoadStudents = addModalOpen && addMode === "select";
    if (!needLoadStudents) return;
    (async () => {
      try {
        setLoadingUsers(true);
        const res = await getUsersByRole(3);
        const list = res?.data ?? [];
        setStudentsPool(list);
      } catch (e: any) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [addModalOpen, addMode]);

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
    setSelectedStudentId(null);
    setAutoMaxMembers(0);
    setAddMode("select");
    setAddModalOpen(true);
  };

  const handleAddStudent = async () => {
    if (!detail || !id) return;
    setSubmittingAdd(true);
    try {
      if (addMode === "select") {
        if (!selectedStudentId) {
          toast.error("Please select a student to add.");
          return;
        }
        await addStudentToClass(Number(id), {
          studentId: Number(selectedStudentId),
        });
        const picked = studentsPool.find(
          (u) => String(u.userId) === String(selectedStudentId)
        );
        const newStudent = picked
          ? {
              userId: picked.userId,
              fullName: picked.fullName,
              email: picked.email,
              enrolledAt: new Date().toISOString(),
            }
          : {
              userId: selectedStudentId,
              fullName: "New Student",
              email: "",
              enrolledAt: new Date().toISOString(),
            };
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                totalStudents: (prev.totalStudents ?? 0) + 1,
                students: [newStudent as any, ...prev.students],
              }
            : prev
        );
        setStudentsPool((prev) =>
          prev.filter((u) => String(u.userId) !== String(selectedStudentId))
        );
        toast.success("Student added to class successfully.");
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
              : prev
          );
          setStudentsPool((prev) =>
            prev.filter(
              (u) =>
                !mapped.some((m: any) => String(m.userId) === String(u.userId))
            )
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
              : prev
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
                (s: any) => Number(s.userId) !== Number(studentId)
              ),
            }
          : prev
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
        onCancel={() => setAddModalOpen(false)}
        onOk={handleAddStudent}
        okText={addMode === "select" ? "Add Student" : "Auto Fill"}
        confirmLoading={submittingAdd}
        destroyOnClose
      >
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
            </Space>
          </Radio.Group>

          <Divider className="my-2" />

          {addMode === "select" ? (
            <div className="space-y-1">
              <Text>Select Student</Text>
              <Select
                showSearch
                placeholder="Search by name or email"
                optionFilterProp="label"
                loading={loadingUsers}
                value={selectedStudentId ?? undefined}
                onChange={(val) => setSelectedStudentId(val)}
                className="w-full"
                options={(studentsPool ?? []).map((u) => ({
                  value: u.userId,
                  label: `${u.fullName} — ${u.email}`,
                }))}
                notFoundContent={loadingUsers ? "Loading..." : "No data"}
              />
            </div>
          ) : (
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
          )}
        </div>
      </Modal>
    </div>
  );
}
