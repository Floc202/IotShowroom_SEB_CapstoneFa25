import { useEffect, useState } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Row,
  Col,
  Card,
  Button,
  Skeleton,
  Empty,
  Form,
  Input,
  Select,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type { Semester } from "../../types/semesters";
import type { ClassItem } from "../../types/classes";
import {
  getClassesBySemester,
  createClass,
  deleteClass,
} from "../../api/classes";
import { getUsersByRole } from "../../api/users";
import {
  GraduationCap,
  Users,
  FolderOpen,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  semester: Semester | null;
};

type CreateFormValues = {
  className: string;
  description?: string;
  instructorId?: number;
};

export default function SemesterDetailModal({
  open,
  onClose,
  semester,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [instructors, setInstructors] = useState<
    { label: string; value: number }[]
  >([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [form] = Form.useForm<CreateFormValues>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !semester) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getClassesBySemester(semester.semesterId);
        setClasses(res.data ?? []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, semester]);

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      const res = await getUsersByRole(2);
      const opts =
        (res.data ?? []).map((u) => ({
          label: `${u.fullName} (${u.email})`,
          value: u.userId,
        })) || [];
      setInstructors(opts);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load instructors");
    } finally {
      setLoadingInstructors(false);
    }
  };

  const openCreate = async () => {
    form.resetFields();
    setCreateOpen(true);
    await fetchInstructors();
  };

  const handleCreate = async () => {
    try {
      if (!semester) return;
      const values = await form.validateFields();
      setCreating(true);
      const res = await createClass({
        className: values.className,
        semesterId: semester.semesterId,
        description: values.description || "",
        instructorId: values.instructorId ?? 0,
      });
      if (!res.isSuccess) {
        toast.error(res.message || "Create failed");
        return;
      }
      setClasses((prev) => [res.data, ...prev]);
      toast.success("Class created");
      setCreateOpen(false);
      form.resetFields();
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    try {
      const res = await deleteClass(classId);
      if (!res.isSuccess) {
        toast.error(res.message || "Delete failed");
        return;
      }
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
      toast.success("Class deleted");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white grid place-items-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-base">{semester?.name}</div>
              <div className="text-gray-500 text-xs">{semester?.code}</div>
            </div>
          </div>
        }
        width={980}
        destroyOnClose
      >
        <div className="space-y-6">
          <Descriptions bordered column={3} size="small">
            <Descriptions.Item label="Code">
              <Tag color="blue">{semester?.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Year">{semester?.year}</Descriptions.Item>
            <Descriptions.Item label="Term">
              <Tag
                color={
                  semester?.term === "FA"
                    ? "orange"
                    : semester?.term === "SP"
                    ? "green"
                    : "purple"
                }
              >
                {semester?.term}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Start">
              {semester && dayjs(semester.startDate).format("YYYY-MM-DD")}
            </Descriptions.Item>
            <Descriptions.Item label="End">
              {semester && dayjs(semester.endDate).format("YYYY-MM-DD")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {semester?.isActive ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Classes" span={3}>
              {classes.length}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <div className="flex items-center justify-between mb-3 mt-3">
              <div className="text-sm font-semibold text-gray-900">
                Classes in this semester
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={openCreate}
                disabled={!semester}
              >
                Create Class
              </Button>
            </div>

            {loading ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Col span={8} key={i}>
                    <Card>
                      <Skeleton active />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : classes.length === 0 ? (
              <Empty description="No classes found" />
            ) : (
              <Row gutter={[16, 16]}>
                {classes.map((c) => (
                  <Col xs={24} md={12} lg={8} key={c.classId}>
                    <Card
                      className="hover:shadow-md transition-shadow"
                      title={
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{c.className}</span>
                        </div>
                      }
                      extra={
                        <Tag>{dayjs(c.createdAt).format("YYYY-MM-DD")}</Tag>
                      }
                    >
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-600 line-clamp-2">
                          {c.description}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4" />
                          <span>{c.totalStudents} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <GraduationCap className="w-4 h-4" />
                          <span>Instructor: {c.instructorName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <span>Groups: {c.totalGroups}</span>
                          <span>•</span>
                          <span>Projects: {c.totalProjects}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between">
                        <Popconfirm
                          title="Delete class?"
                          description={`This will remove ${c.className}.`}
                          okText="Delete"
                          okType="danger"
                          placement="bottomLeft"
                          onConfirm={() => handleDeleteClass(c.classId)}
                        >
                          <Button
                            danger
                            icon={<Trash2 className="w-4 h-4" />}
                          />
                        </Popconfirm>

                        <Button
                          type="primary"
                          icon={<ArrowRight className="w-4 h-4" />}
                          onClick={() =>
                            navigate(`/admin/classes/${c.classId}`)
                          }
                        >
                          View details
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Create"
        confirmLoading={creating}
        title={
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Create new class</span>
          </div>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="className"
            label="Class name"
            rules={[{ required: true, message: "Please input class name" }]}
          >
            <Input placeholder="e.g., SE1718_IoT_FA25" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Short description" />
          </Form.Item>

          <Form.Item name="instructorId" label="Instructor">
            <Select
              allowClear
              placeholder="Select instructor (optional)"
              loading={loadingInstructors}
              options={instructors}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
