import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Tag, Empty, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { GraduationCap, Search } from "lucide-react";
import { getInstructorClasses } from "../../api/instructor";
import type { InstructorClassItem } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

export default function InstructorClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<InstructorClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<InstructorClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  const columns: ColumnsType<InstructorClassItem> = [
    {
      title: "Class Name",
      dataIndex: "className",
      key: "className",
      render: (text: string, record: InstructorClassItem) => (
        <a
          onClick={() => navigate(`/instructor/classes/${record.classId}`)}
          className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
    },
    {
      title: "Semester Code",
      dataIndex: "semesterCode",
      key: "semesterCode",
      width: 150,
    },
    {
      title: "Students",
      dataIndex: "totalStudents",
      key: "totalStudents",
      width: 100,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Groups",
      dataIndex: "totalGroups",
      key: "totalGroups",
      width: 100,
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "Projects",
      dataIndex: "totalProjects",
      key: "totalProjects",
      width: 100,
      render: (count: number) => <Tag color="purple">{count}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
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

        {filteredClasses.length > 0 ? (
          <Table<InstructorClassItem>
            loading={loading}
            rowKey="classId"
            columns={columns}
            dataSource={filteredClasses}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        ) : (
          <Empty description={searchText ? "No classes found" : "No classes assigned"} />
        )}
      </Card>
    </div>
  );
}
