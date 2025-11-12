import { useEffect, useState, useCallback } from "react";
import { Empty, Table, Tag, Tooltip, Button, Popover } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Eye, MoreHorizontal, RefreshCcw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudentClasses } from "../../api/student";
import type { StudentClassItem } from "../../types/student";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

export default function StudentClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<StudentClassItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudentClasses();
      if (!res.isSuccess) {
        toast.error(res.message || "Failed to load classes");
        return;
      }
      const sorted = (res.data || [])
        .slice()
        .sort((a, b) => a.className.localeCompare(b.className));
      setClasses(sorted);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const columns: ColumnsType<StudentClassItem> = [
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
      render: (v: string) => <span className="font-medium">{v}</span>,
      sorter: (a, b) => a.className.localeCompare(b.className),
      fixed: "left",
      width: 260,
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
      width: 160,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
      sorter: (a, b) => a.semesterName.localeCompare(b.semesterName),
    },
    {
      title: "Instructor",
      dataIndex: "instructorName",
      key: "instructorName",
      width: 220,
      render: (v?: string | null) =>
        v || <span className="text-gray-400">—</span>,
      sorter: (a, b) =>
        String(a.instructorName || "").localeCompare(
          String(b.instructorName || "")
        ),
    },
    {
      title: "Enrolled At",
      dataIndex: "enrolledAt",
      key: "enrolledAt",
      width: 170,
      render: (d: string) => (
        <Tooltip title={dayjs(d).format("dddd, MMM DD YYYY HH:mm")}>
          {dayjs(d).format("YYYY-MM-DD")}
        </Tooltip>
      ),
      sorter: (a, b) =>
        dayjs(a.enrolledAt).valueOf() - dayjs(b.enrolledAt).valueOf(),
    },
    {
      title: "My Group",
      key: "myGroup",
      width: 180,
      render: (_, r) =>
        r.myGroup ? (
          <Tag icon={<Users className="w-3.5 h-3.5" />} color="green">
            {r.myGroup.groupName}
          </Tag>
        ) : (
          <Tag color="default">—</Tag>
        ),
      sorter: (a, b) =>
        (a.myGroup?.groupName || "").localeCompare(b.myGroup?.groupName || ""),
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
              onClick={() =>
                navigate(`/student/classes/${r.classId}`, { state: r })
              }
            >
              <Eye className="w-4 h-4" /> View
            </Button>
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600 mt-2">Your enrolled classes</p>
        </div>
        <Button
          icon={<RefreshCcw className="w-4 h-4" />}
          onClick={fetchClasses}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {classes.length === 0 ? (
          <Empty description="No classes found" />
        ) : (
          <Table<StudentClassItem>
            rowKey="classId"
            columns={columns}
            dataSource={classes}
            loading={loading}
            size="middle"
            bordered
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        )}
      </div>
    </div>
  );
}
