import { Table, Tag, Tooltip, Button, Popconfirm, Popover, Divider } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Eye, Pencil, Trash2, MoreHorizontal, Users, RefreshCw } from "lucide-react";
import type { ClassItem } from "../../types/classes";

type Props = {
  data: ClassItem[];
  loading?: boolean;
  onView: (id: number) => void;
  onEdit: (record: ClassItem) => void;
  onDelete: (record: ClassItem) => void;
  onManageGraders?: (classItem: ClassItem) => void;
  onChangeStatus?: (classItem: ClassItem, newStatus: ClassItem["status"]) => void;
};

export default function ClassesTable({
  data,
  loading,
  onView,
  onEdit,
  onDelete,
  onManageGraders,
  onChangeStatus,
}: Props) {
  const getStatusColor = (status: ClassItem["status"]) => {
    switch (status) {
      case "In Progress":
        return "blue";
      case "Completed":
        return "green";
      case "Not Started":
      default:
        return "default";
    }
  };

  const getNextStatus = (currentStatus: ClassItem["status"]): ClassItem["status"] | null => {
    switch (currentStatus) {
      case "Not Started":
        return "In Progress";
      case "In Progress":
        return "Completed";
      case "Completed":
        return null; 
      default:
        return null;
    }
  };

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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: ClassItem["status"]) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: "Not Started", value: "Not Started" },
        { text: "In Progress", value: "In Progress" },
        { text: "Completed", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      width: 160,
      render: (d: string | null) =>
        d ? (
          <Tooltip title={dayjs(d).format("dddd, MMM DD YYYY HH:mm")}>
            {dayjs(d).format("YYYY-MM-DD")}
          </Tooltip>
        ) : (
          <span className="text-gray-400">—</span>
        ),
      sorter: (a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf();
      },
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
        const nextStatus = getNextStatus(r.status);
        
        const content = (
          <div className="w-52">
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
            {onManageGraders && (
              <Button
                type="text"
                className="w-full flex items-start justify-start gap-2 px-3"
                onClick={() => onManageGraders(r)}
              >
                <Users className="w-4 h-4" /> Manage Graders
              </Button>
            )}
            
            {onChangeStatus && nextStatus && (
              <>
                <Divider className="m-divider"/>
                <Button
                  type="text"
                  className="w-full flex items-start justify-start gap-2 px-3"
                  onClick={() => onChangeStatus(r, nextStatus)}
                >
                  <RefreshCw className="w-4 h-4" /> Change to {nextStatus}
                </Button>
              </>
            )}
            
            <Divider className="m-divider" />
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
      scroll={{ x: 1400 }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
    />
  );
}
