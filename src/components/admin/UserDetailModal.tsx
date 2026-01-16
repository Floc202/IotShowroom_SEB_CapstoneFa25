import { useEffect, useState } from "react";
import { Modal, Spin, Descriptions, Tag, Card, Empty, Divider } from "antd";
import { User, GraduationCap, Calendar, Award, FileText, CheckCircle, XCircle } from "lucide-react";
import type { UserItem } from "../../types/users";
import type { StudentCourseHistory } from "../../types/student";
import { getUserById } from "../../api/users";
import { getStudentCourseHistoryAll } from "../../api/student";
import toast from "react-hot-toast";
import { getErrorMessage, formatVietnamTime } from "../../utils/helpers";

interface UserDetailModalProps {
  userId: number;
  visible: boolean;
  onClose: () => void;
}

const ROLE_MAP = {
  1: "Admin",
  2: "Instructor",
  3: "Student",
};

const getRoleName = (roleId: string | number) => {
  return ROLE_MAP[roleId as keyof typeof ROLE_MAP] || "Unknown";
};

const getRoleColor = (roleId: string | number) => {
  const roleName = getRoleName(roleId).toLowerCase();
  switch (roleName) {
    case "admin":
      return "red";
    case "instructor":
      return "blue";
    case "student":
      return "green";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "pass":
      return "green";
    case "in_progress":
      return "blue";
    case "retake":
      return "orange";
    case "not pass":
      return "red";
    default:
      return "default";
  }
};

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserItem | null>(null);
  const [courseHistories, setCourseHistories] = useState<StudentCourseHistory[]>([]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const userRes = await getUserById(userId);
      if (userRes.isSuccess && userRes.data) {
        setUser(userRes.data);
        
        if (userRes.data.roleId === 3) {
          try {
            const historyRes = await getStudentCourseHistoryAll(userId);
            if (historyRes.isSuccess && historyRes.data) {
              const validHistories = historyRes.data.filter(h => h.semesterId != null);
              setCourseHistories(validHistories);
            }
          } catch (error) {
            console.error("Failed to fetch course history:", error);
          }
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userId) {
      fetchUserDetail();
    } else {
      setUser(null);
      setCourseHistories([]);
    }
  }, [visible, userId]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <User size={20} />
          User Details
        </div>
      }
      style={{top: 10}}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          <Card className="bg-gray-50">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Full Name" span={2}>
                <span className="font-medium">{user.fullName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {user.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={getRoleColor(user.roleId || 0)}>
                  {getRoleName(user.roleId || 0)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {user.userId}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {user.roleId === 3 && (
            <>
              <Divider orientation="left">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} />
                  <span>Course History ({courseHistories.length})</span>
                </div>
              </Divider>

              {courseHistories.length > 0 ? (
                <div className="space-y-4">
                  {courseHistories.map((courseHistory) => {
                    const hasFinalGrade = courseHistory.finalGrade !== null && courseHistory.finalGrade !== undefined;
                    const hasAvgGrade = courseHistory.averageGradeFromOtherInstructors !== null && courseHistory.averageGradeFromOtherInstructors !== undefined;
                    
                    const isPassed = hasFinalGrade && courseHistory.finalGrade >= 5;
                    const isPassedByOthers = hasAvgGrade && courseHistory.averageGradeFromOtherInstructors >= 5;
                    
                    const getFinalGradeCardClass = () => {
                      if (!hasFinalGrade) return "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300";
                      return isPassed 
                        ? "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400" 
                        : "bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-400";
                    };
                    
                    const getAvgGradeCardClass = () => {
                      if (!hasAvgGrade) return "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300";
                      return isPassedByOthers 
                        ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-400" 
                        : "bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-400";
                    };
                    
                    return (
                      <Card 
                        key={courseHistory.historyId} 
                        className={courseHistory.isCurrent ? "border-2 border-blue-400" : ""}
                      >
                        {courseHistory.isCurrent && (
                          <div className="absolute top-2 right-2">
                            <Tag color="blue">Current Semester</Tag>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-4">
                              <Calendar size={20} className="text-blue-600" />
                              <span className="font-bold text-lg">{courseHistory.semesterName}</span>
                            </div>
                            <Tag color={getStatusColor(courseHistory.status)}>
                              {courseHistory.status}
                            </Tag>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Card className={`${getFinalGradeCardClass()} shadow-lg`}>
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  {!hasFinalGrade ? (
                                    <Award size={24} className="text-gray-500" />
                                  ) : isPassed ? (
                                    <CheckCircle size={24} className="text-green-600" />
                                  ) : (
                                    <XCircle size={24} className="text-red-600" />
                                  )}
                                  <span className="text-sm font-medium text-gray-600">Final Grade</span>
                                </div>
                                <div className={`text-4xl font-bold ${
                                  !hasFinalGrade ? "text-gray-500" : isPassed ? "text-green-700" : "text-red-700"
                                }`}>
                                  {hasFinalGrade ? courseHistory.finalGrade.toFixed(2) : "—"}
                                </div>
                                <Tag color={!hasFinalGrade ? "default" : isPassed ? "green" : "red"} className="text-xs">
                                  {!hasFinalGrade ? "PENDING" : isPassed ? "PASSED" : "NOT PASSED"}
                                </Tag>
                              </div>
                            </Card>

                            <Card className={`${getAvgGradeCardClass()} shadow-lg`}>
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  {!hasAvgGrade ? (
                                    <Award size={24} className="text-gray-500" />
                                  ) : isPassedByOthers ? (
                                    <CheckCircle size={24} className="text-blue-600" />
                                  ) : (
                                    <XCircle size={24} className="text-orange-600" />
                                  )}
                                  <span className="text-sm font-medium text-gray-600">Avg Grade from Others</span>
                                </div>
                                <div className={`text-4xl font-bold ${
                                  !hasAvgGrade ? "text-gray-500" : isPassedByOthers ? "text-blue-700" : "text-orange-700"
                                }`}>
                                  {hasAvgGrade ? courseHistory.averageGradeFromOtherInstructors.toFixed(2) : "—"}
                                </div>
                                <Tag color={!hasAvgGrade ? "default" : isPassedByOthers ? "blue" : "orange"} className="text-xs">
                                  {!hasAvgGrade ? "PENDING" : isPassedByOthers ? "PASSED" : "NOT PASSED"}
                                </Tag>
                              </div>
                            </Card>
                          </div>

                          <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Is Current">
                              <Tag color={courseHistory.isCurrent ? "green" : "default"}>
                                {courseHistory.isCurrent ? "Yes" : "No"}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Is Retake">
                              <Tag color={courseHistory.isRetake ? "orange" : "green"}>
                                {courseHistory.isRetake ? "Yes" : "No"}
                              </Tag>
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Final Submission ID">
                              {courseHistory.finalSubmissionId || "—"}
                            </Descriptions.Item> */}
                            <Descriptions.Item label="Evaluated At">
                              {formatVietnamTime(courseHistory.evaluatedAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Completed At">
                              {formatVietnamTime(courseHistory.completedAt)}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="Created At">
                              {formatVietnamTime(courseHistory.createdAt)}
                            </Descriptions.Item> */}
                            {courseHistory.notes && (
                              <Descriptions.Item label="Notes" span={2}>
                                <div className="flex gap-2">
                                  <FileText size={16} className="text-gray-500 mt-1" />
                                  <span className="text-gray-700">{courseHistory.notes}</span>
                                </div>
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  description="Student has not participated in any semester"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <Empty description="User not found" />
      )}
    </Modal>
  );
};

export default UserDetailModal;
