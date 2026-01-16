import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  InputNumber,
  Popover,
  Popconfirm,
  Tooltip,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import {
  listSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getSemestersByYear,
} from "../../api/semesters";
import type { Semester } from "../../types/semesters";
import toast from "react-hot-toast";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  RefreshCcw,
  Plus,
} from "lucide-react";
import { getErrorMessage } from "../../utils/helpers";
import SemesterDetailModal from "../../components/semesters/SemesterDetailModal";

type FormValues = {
  code?: string;
  name: string;
  year: number;
  term: string;
  range: [Dayjs, Dayjs];
  isActive: boolean;
};

const termOptions = [
  { label: "Fall (FA)", value: "FA" },
  { label: "Spring (SP)", value: "SP" },
  { label: "Summer (SU)", value: "SU" },
];

const termFullNames: Record<string, string> = {
  FA: "Fall",
  SP: "Spring",
  SU: "Summer",
};

const termPriority: Record<string, number> = {
  FA: 1,
  SU: 2,
  SP: 3,
};

const toISO = (d: Dayjs) => d.format("YYYY-MM-DD");

const currentYear = dayjs().year();

export default function SemesterManagement() {
  const [form] = Form.useForm<FormValues>();

  const [data, setData] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSemester, setDetailSemester] = useState<Semester | null>(null);

  const getDisabledDate = (current: Dayjs) => {
    const selectedYear = form.getFieldValue('year');
    
    if (!selectedYear) {
      return current && current.isBefore(dayjs().startOf('day'));
    }

    if (selectedYear > currentYear) {
      return current && current.isBefore(dayjs(`${selectedYear}-01-01`).startOf('day'));
    }

    return current && current.isBefore(dayjs().startOf('day'));
  };

  const generateCodeAndName = () => {
    const year = form.getFieldValue('year');
    const term = form.getFieldValue('term');

    if (year && term) {
      const yearShort = year.toString().slice(-2);
      const code = `${term}${yearShort}`;
      const name = `${termFullNames[term]} ${year}`;
      
      form.setFieldsValue({ code, name });
    }
  };

  const openDetail = (record: Semester) => {
    setDetailSemester(record);
    setDetailOpen(true);
  };

  const pagedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return data.slice(start, start + pagination.pageSize);
  }, [data, pagination]);
  const total = data.length;

  const fetchAll = async () => {
    try {
      setLoading(true);
      if (yearFilter) {
        const res = await getSemestersByYear(yearFilter);
        const sorted = (res.data || [])
          .slice()
          .sort((a, b) => {
            if (a.isActive !== b.isActive) {
              return a.isActive ? -1 : 1;
            }
            
            const codeYearA = parseInt(a.code.slice(-2), 10);
            const codeYearB = parseInt(b.code.slice(-2), 10);
            
            if (codeYearB !== codeYearA) {
              return codeYearB - codeYearA;
            }
            
            const codeTermA = a.code.slice(0, 2).toUpperCase();
            const codeTermB = b.code.slice(0, 2).toUpperCase();
            return (termPriority[codeTermA] || 999) - (termPriority[codeTermB] || 999);
          });
        setData(sorted);
      } else {
        const res = await listSemesters();
        const sorted = (res.data || [])
          .slice()
          .sort((a, b) => {
            if (a.isActive !== b.isActive) {
              return a.isActive ? -1 : 1;
            }
            
            const codeYearA = parseInt(a.code.slice(-2), 10);
            const codeYearB = parseInt(b.code.slice(-2), 10);
            
            if (codeYearB !== codeYearA) {
              return codeYearB - codeYearA;
            }
            
            const codeTermA = a.code.slice(0, 2).toUpperCase();
            const codeTermB = b.code.slice(0, 2).toUpperCase();
            return (termPriority[codeTermA] || 999) - (termPriority[codeTermB] || 999);
          });
        setData(sorted);
      }
    } catch (e: any) {
      const msg = getErrorMessage(e);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    setPagination((p) => ({ ...p, current: 1 }));
  }, [yearFilter]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (record: Semester) => {
    setEditing(record);
    setModalOpen(true);
  };

  useEffect(() => {
    if (modalOpen && editing) {
      form.setFieldsValue({
        code: editing.code,
        name: editing.name,
        year: editing.year,
        term: editing.term,
        range: [dayjs(editing.startDate), dayjs(editing.endDate)],
        isActive: editing.isActive,
      });
    }
    if (modalOpen && !editing) form.resetFields();
  }, [modalOpen, editing, form]);

  const handleDelete = async (record: Semester) => {
    try {
      const res = await deleteSemester(record.semesterId);
      if (!res.isSuccess) return toast.error(res.message || "Delete failed");
      setData((prev) => prev.filter((s) => s.semesterId !== record.semesterId));
      toast.success("Deleted");
    } catch (e: any) {
      const msg = getErrorMessage(e);
      toast.error(msg);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.range as [Dayjs, Dayjs];

      if (editing) {
        const payload = {
          name: values.name,
          year: values.year,
          term: values.term,
          startDate: toISO(start),
          endDate: toISO(end),
          isActive: values.isActive,
        };
        const res = await updateSemester(editing.semesterId, payload);
        if (!res.isSuccess) return toast.error(res.message || "Update failed");
        const updated = res.data;
        
        if (values.isActive) {
          setData((prev) =>
            prev.map((s) => 
              s.semesterId === updated.semesterId 
                ? updated 
                : { ...s, isActive: false }
            )
          );
        } else {
          setData((prev) =>
            prev.map((s) => (s.semesterId === updated.semesterId ? updated : s))
          );
        }
        toast.success("Updated");
      } else {
        const payload = {
          code: values.code!,
          name: values.name,
          year: values.year,
          term: values.term,
          startDate: toISO(start),
          endDate: toISO(end),
          // isActive: values.isActive,
        };
        const res = await createSemester(payload);
        if (!res.isSuccess) return toast.error(res.message || "Create failed");
        
        if (values.isActive) {
          setData((prev) => [res.data, ...prev.map(s => ({ ...s, isActive: false }))]);
        } else {
          setData((prev) => [res.data, ...prev]);
        }
        toast.success("Created");
      }

      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    }
  };

  const ActionCell: React.FC<{ record: Semester }> = ({ record }) => {
    const content = (
      <div className="w-40">
        <Button
          type="text"
          className="w-full flex items-start justify-start gap-2 px-3"
          onClick={() => openDetail(record)}
        >
          <Eye className="w-4 h-4" /> View
        </Button>
        <Button
          type="text"
          className="w-full flex items-start justify-start gap-2 px-3"
          onClick={() => openEdit(record)}
        >
          <Pencil className="w-4 h-4" /> Edit
        </Button>

        <Popconfirm
          title="Delete semester?"
          description={`This will remove ${record.name} (${record.code}).`}
          okText="Delete"
          okType="danger"
          placement="bottomLeft"
          onConfirm={() => handleDelete(record)}
        >
          <Button
            type="text"
            danger
            className="w-full flex items-start justify-start gap-2 px-3"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </Popconfirm>
      </div>
    );

    return (
      <Popover
        trigger="click"
        placement="bottomRight"
        overlayInnerStyle={{ padding: 4 }}
        content={content}
      >
        <Button type="text" icon={<MoreHorizontal className="w-5 h-5" />} />
      </Popover>
    );
  };

  const columns: ColumnsType<Semester> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (v: string) => (
        <Space size={6}>
          <Tag color="blue">{v}</Tag>
        </Space>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
      fixed: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (v: string) => (
        <span className="font-medium text-gray-900">{v}</span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      ellipsis: true,
      render: (v: boolean) => {
        return v ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "Term",
      dataIndex: "term",
      key: "term",
      render: (t: string) => (
        <Tag color={t === "FA" ? "orange" : t === "SP" ? "green" : "purple"}>
          {t}
        </Tag>
      ),
      filters: [
        { text: "FA", value: "FA" },
        { text: "SP", value: "SP" },
        { text: "SU", value: "SU" },
      ],
      onFilter: (value, record) => record.term === value,
    },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      render: (d: string) => (
        <Tooltip title={dayjs(d).format("dddd, MMM DD YYYY")}>
          {dayjs(d).format("YYYY-MM-DD")}
        </Tooltip>
      ),
      sorter: (a, b) =>
        dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      render: (d: string) => (
        <Tooltip title={dayjs(d).format("dddd, MMM DD YYYY")}>
          {dayjs(d).format("YYYY-MM-DD")}
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf(),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 60,
      render: (_, record) => <ActionCell record={record} />,
    },
  ];

  return (
    <div className="p-8 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Semester Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage academic semesters, timelines, and status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Space wrap>
          <InputNumber
            placeholder="Filter by year"
            value={yearFilter}
            onChange={(v) => setYearFilter(v ?? undefined)}
            min={1900}
            max={2100}
            className="!w-40"
          />
          <Button icon={<RefreshCcw className="w-4 h-4" />} onClick={fetchAll}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={openCreate}
          >
            New Semester
          </Button>
        </Space>

        <Table<Semester>
          rowKey="semesterId"
          loading={loading}
          columns={columns}
          dataSource={pagedData}
          size="middle"
          bordered
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            onChange: (current, pageSize) =>
              setPagination({ current, pageSize }),
          }}
          scroll={{ x: 1100 }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={
          <div className="flex items-center gap-2">
            {editing ? (
              <Pencil className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{editing ? "Edit Semester" : "New Semester"}</span>
          </div>
        }
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editing ? "Save changes" : "Create"}
        destroyOnClose
      >
        <Form<FormValues> form={form} layout="vertical" preserve>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="year"
                label="Year"
                rules={[
                  { required: true, message: "Please input year" },
                  {
                    validator: (_, value) => {
                      if (value && value < currentYear) {
                        return Promise.reject(new Error(`Year must be ${currentYear} or later`));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  className="w-full" 
                  min={currentYear} 
                  max={2100}
                  onChange={() => {
                    form.setFieldsValue({ range: undefined });
                    generateCodeAndName();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="term"
                label="Term"
                rules={[{ required: true, message: "Please select term" }]}
              >
                <Select 
                  options={termOptions} 
                  placeholder="Select term"
                  onChange={generateCodeAndName}
                />
              </Form.Item>
            </Col>
          </Row>

          {!editing && (
            <Form.Item
              name="code"
              label="Code"
            >
              <Input placeholder="Auto-generated from Year and Term" />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Name"
          >
            <Input placeholder="Auto-generated from Year and Term" />
          </Form.Item>

          <Form.Item
            name="range"
            label="Start / End"
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <DatePicker.RangePicker 
              className="w-full" 
              disabledDate={getDisabledDate}
            />
          </Form.Item>

          {editing && (
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                onChange={(checked) => {
                  form.setFieldsValue({ isActive: checked });
                }}
              />
            </Form.Item>
          )}

        </Form>
      </Modal>

      <SemesterDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        semester={detailSemester}
      />
    </div>
  );
}
