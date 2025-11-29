import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tag, Empty, Input, Button, Row, Col } from "antd";
import { GraduationCap, Search, Eye, Users, FolderKanban, Calendar } from "lucide-react";
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
                      Created: {new Date(cls.createdAt).toLocaleDateString()}
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
