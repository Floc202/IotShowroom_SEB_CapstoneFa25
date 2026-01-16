import { useMemo, useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Spin } from "antd";
import {
  Mail,
  Phone,
  User2,
  ShieldCheck,
  Pencil,
  BadgeCheck,
  UploadCloud,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import type { UpdateUserRequest } from "../../types/users";
import type { StudentCourseHistory } from "../../types/student";
import { updateUser } from "../../api/users";
import { uploadCloudinary } from "../../api/upload";
import { getStudentCourseHistoryAll } from "../../api/student";
import toast from "react-hot-toast";
import { getErrorMessage, formatVietnamTime } from "../../utils/helpers";

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Admin: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  Instructor: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  Student: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
};

type FormVals = {
  fullName?: string;
  phone?: string;
  newPassword?: string;
  avatarFile?: File | null;
};

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<FormVals>();
  const [courseHistories, setCourseHistories] = useState<StudentCourseHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user && user.roleName === "Student" && user.userId) {
      fetchCourseHistory();
    }
  }, [user]);

  const fetchCourseHistory = async () => {
    if (!user?.userId) return;
    try {
      setLoadingHistory(true);
      const res = await getStudentCourseHistoryAll(user.userId);
      if (res.isSuccess && res.data) {
        const validHistories = res.data.filter(h => h.semesterId != null);
        setCourseHistories(validHistories);
      }
    } catch (e) {
      console.error("Failed to fetch course history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-2">
              <User2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Not Logged In</h2>
            <p className="text-gray-600">
              Please log in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );

  const roleColors = ROLE_COLORS[user.roleName] || ROLE_COLORS.Student;

  const initialVals = useMemo<FormVals>(
    () => ({
      fullName: user.fullName || "",
      phone: user.phone || "",
      newPassword: "",
      avatarFile: null,
    }),
    [user]
  );

  const openEdit = () => {
    form.setFieldsValue(initialVals);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields();
      setSubmitting(true);

      let avatarUrl: string | undefined;
      const file: File | null | undefined = vals.avatarFile as any;

      if (file) {
        const up = await uploadCloudinary(file, "avatar");
        if (!up.isSuccess) {
          toast.error(up.message || "Upload avatar thất bại");
          setSubmitting(false);
          return;
        }
        avatarUrl = up.data.secureUrl || up.data.url;
      }

      const payload: UpdateUserRequest = {
        fullName: vals.fullName?.trim() || undefined,
        phone: vals.phone?.trim() || undefined,
        newPassword: vals.newPassword ? vals.newPassword : undefined,
        avatarUrl,
      };

      const res = await updateUser(user.userId, payload);
      if (!res.isSuccess) {
        toast.error(res.message || "Cập nhật thất bại");
        setSubmitting(false);
        return;
      }

      await refreshMe();
      toast.success("Update successful");
      setOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
          
          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-white">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                      {user.fullName?.[0] || 'U'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 pt-4 md:pt-16">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {user.fullName}
                      </h1>
                      <BadgeCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${roleColors.bg} ${roleColors.text} border ${roleColors.border}`}>
                        <ShieldCheck className="w-4 h-4" />
                        {user.roleName}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                        <User2 className="w-4 h-4" />
                        ID: {user.userId ?? "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 !text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-white" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</div>
                      <div className="font-medium text-gray-900 break-all">{user.email || "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone Number</div>
                      <div className="font-medium text-gray-900">{user.phone || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                    <span className="text-sm font-semibold text-gray-900">{user.fullName || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Role</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${roleColors.bg} ${roleColors.text}`}>
                      {user.roleName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">Joined At</span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatVietnamTime(user.createdAt, "DD/MM/YYYY")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {user.roleName === "Student" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course History</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {courseHistories.length} {courseHistories.length === 1 ? 'semester' : 'semesters'} completed
                </p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-16">
                <Spin size="large" />
              </div>
            ) : courseHistories.length > 0 ? (
              <div className="space-y-5">
                {courseHistories.map((history) => {
                  const hasFinalGrade = history.finalGrade !== null && history.finalGrade !== undefined;
                  const hasAvgGrade = history.averageGradeFromOtherInstructors !== null && history.averageGradeFromOtherInstructors !== undefined;
                  
                  const isPassed = hasFinalGrade && history.finalGrade >= 5;
                  const isPassedByOthers = hasAvgGrade && history.averageGradeFromOtherInstructors >= 5;
                  
                  return (
                    <div
                      key={history.historyId}
                      className={`relative border-2 rounded-xl p-6 transition-all hover:shadow-xl ${
                        history.isCurrent 
                          ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {history.isCurrent && (
                        <div className="absolute top-5 right-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                            Current Semester
                          </span>
                        </div>
                      )}
                      
                      <div className="mb-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{history.semesterName}</h3>
                          {history.isRetake && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
                              Retake
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 ml-11">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Evaluated:</span> 
                            <span>{formatVietnamTime(history.evaluatedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Completed:</span> 
                            <span>{formatVietnamTime(history.completedAt)}</span>
                          </div>
                        </div>

                        {history.notes && (
                          <div className="mt-4 ml-11 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg">
                            <p className="text-sm text-gray-800">
                              <span className="font-bold text-amber-700">Note: </span>
                              {history.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`relative p-5 rounded-xl border-2 transition-all ${
                          !hasFinalGrade 
                            ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' 
                            : isPassed 
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm' 
                            : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Final Grade</span>
                            {!hasFinalGrade ? (
                              <Award className="w-5 h-5 text-gray-400" />
                            ) : isPassed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className={`text-4xl font-black mb-2 ${
                            !hasFinalGrade ? 'text-gray-400' : isPassed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {hasFinalGrade ? history.finalGrade.toFixed(2) : '—'}
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                            !hasFinalGrade 
                              ? 'bg-gray-300 text-gray-700' 
                              : isPassed 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {!hasFinalGrade ? 'PENDING' : isPassed ? 'PASSED' : 'NOT PASSED'}
                          </span>
                        </div>

                        <div className={`relative p-5 rounded-xl border-2 transition-all ${
                          !hasAvgGrade 
                            ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' 
                            : isPassedByOthers 
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-sm' 
                            : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Avg from Others</span>
                            {!hasAvgGrade ? (
                              <Award className="w-5 h-5 text-gray-400" />
                            ) : isPassedByOthers ? (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div className={`text-4xl font-black mb-2 ${
                            !hasAvgGrade ? 'text-gray-400' : isPassedByOthers ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {hasAvgGrade ? history.averageGradeFromOtherInstructors.toFixed(2) : '—'}
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                            !hasAvgGrade 
                              ? 'bg-gray-300 text-gray-700' 
                              : isPassedByOthers 
                              ? 'bg-blue-200 text-blue-800' 
                              : 'bg-orange-200 text-orange-800'
                          }`}>
                            {!hasAvgGrade ? 'PENDING' : isPassedByOthers ? 'PASSED' : 'NOT PASSED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                  <GraduationCap className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Course History</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Your academic history will appear here once you enroll in courses.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={
          <div className="flex items-center gap-2 text-lg">
            <Pencil className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Update Personal Information</span>
          </div>
        }
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="Save Changes"
        destroyOnClose
        width={500}
      >
        <Form<FormVals> form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="fullName"
            label={<span className="font-medium text-gray-700">Full Name</span>}
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input 
              placeholder="Nguyễn Văn A" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item 
            name="phone" 
            label={<span className="font-medium text-gray-700">Phone Number</span>}
          >
            <Input 
              placeholder="0123456789" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Avatar</span>}
            name="avatarFile"
            valuePropName="file"
          >
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              listType="picture-card"
              onChange={(info) => {
                const f = info.fileList?.[0]?.originFileObj as File | undefined;
                form.setFieldValue("avatarFile", f || null);
              }}
              className="avatar-uploader"
            >
              <div className="flex flex-col items-center gap-2 p-2">
                <UploadCloud className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Upload Image</span>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
