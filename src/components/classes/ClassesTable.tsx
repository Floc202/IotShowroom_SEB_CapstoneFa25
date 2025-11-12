import { Table, Tag, Tooltip, Button, Popconfirm, Popover } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import type { ClassItem } from "../../types/classes";

type Props = {
  data: ClassItem[];
  loading?: boolean;
  onView: (id: number) => void;
  onEdit: (record: ClassItem) => void;
  onDelete: (record: ClassItem) => void;
};

export default function ClassesTable({
  data,
  loading,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<ClassItem> = [
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
      render: (v: string) => <span className="font-medium">{v}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
      fixed: "left",
      width: 240,
    },
    {
      title: "Semester",
      key: "semester",
      render: (_, r) => (
        <Tag color="blue">
          {r.semesterCode || r.semesterName || r.semesterId}
        </Tag>
      ),
      width: 140,
      sorter: (a, b) =>
        String(a.semesterCode || "").localeCompare(
          String(b.semesterCode || "")
        ),
    },
    {
      title: "Instructor",
      dataIndex: "instructorName",
      key: "instructorName",
      width: 220,
      render: (v) => v || <span className="text-gray-400">—</span>,
      sorter: (a, b) =>
        String(a.instructorName || "").localeCompare(
          String(b.instructorName || "")
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (d: string) => (
        <Tooltip title={dayjs(d).format("dddd, MMM DD YYYY HH:mm")}>
          {dayjs(d).format("YYYY-MM-DD")}
        </Tooltip>
      ),
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
    {
      title: "Students",
      dataIndex: "totalStudents",
      key: "totalStudents",
      align: "right",
      width: 110,
      sorter: (a, b) => (a.totalStudents || 0) - (b.totalStudents || 0),
      render: (v) => v ?? 0,
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 70,
      render: (_, r) => {
        const content = (
          <div className="w-40">
            <Button
              type="text"
              className="w-full flex items-start justify-start gap-2 px-3"
              onClick={() => onView(r.classId)}
            >
              <Eye className="w-4 h-4" /> View
            </Button>
            <Button
              type="text"
              className="w-full flex items-start justify-start gap-2 px-3"
              onClick={() => onEdit(r)}
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Popconfirm
              title="Delete class?"
              description={`This will remove "${r.className}".`}
              okText="Delete"
              okType="danger"
              placement="bottomLeft"
              onConfirm={() => onDelete(r)}
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
      },
    },
  ];

  return (
    <Table<ClassItem>
      rowKey="classId"
      columns={columns}
      dataSource={data}
      loading={loading}
      size="middle"
      bordered
      scroll={{ x: 1100 }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
}
