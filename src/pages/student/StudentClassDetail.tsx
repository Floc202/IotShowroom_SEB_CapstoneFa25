import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Tag,
  Descriptions,
  Button,
  Empty,
  Tooltip,
  Modal,
  Table,
  Divider,
  Drawer,
  Avatar,
  Popconfirm,
  Badge,
  Form,
  Input,
} from "antd";
import {
  ArrowLeft,
  FolderOpen,
  Users,
  Plus,
  RefreshCcw,
  BookOpen,
  Layers,
  Clock,
  Award,
  UserPlus,
  Pencil,
  LogOut,
  UserMinus,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type {
  StudentClassItem,
  SubmissionValidation,
  EditPeriodValidation,
  ProjectGradersInfo,
} from "../../types/student";
import { createGroup, getGroupsByClass } from "../../api/group";
import {
  getStudentClasses,
  validateSubmission,
  validateEditPeriod,
  getProjectGraders,
} from "../../api/student";
import { getProjectByGroup } from "../../api/project";
import { getErrorMessage, formatVietnamTime } from "../../utils/helpers";
import CreateGroupModal from "../../components/group/CreateGroupModal";
import GroupAndProjectOverview from "../../components/group/GroupAndProjectOverview";
import GroupInvitations from "../../components/group/GroupInvitations";
import GroupModals from "../../components/group/GroupModals";
import SyllabusListModal from "../../components/syllabus/SyllabusListModal";
import ProjectTemplateModal from "../../components/student/ProjectTemplateModal";
import { useAuth } from "../../providers/AuthProvider";
import { getProjectGrades } from "../../api/instructor";
import { createChatRoom } from "../../api/chat";
import { ChatButton } from "../../components/chat/ChatButton";
import { getFinalSubmission } from "../../api/finalSubmission";
import type { ProjectGrade } from "../../types/instructor";
import type { FinalSubmission } from "../../types/finalSubmission";
import type { GroupDetail } from "../../types/group";
import { getGroupById, kickMember, leaveGroup, updateGroup, inviteToGroup } from "../../api/group";

export default function StudentClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [cls, setCls] = useState<StudentClassItem | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSyllabus, setOpenSyllabus] = useState(false);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openDeadlines, setOpenDeadlines] = useState(false);
  const [openAllGrades, setOpenAllGrades] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [submissionInfo, setSubmissionInfo] =
    useState<SubmissionValidation | null>(null);
  const [editPeriodInfo, setEditPeriodInfo] =
    useState<EditPeriodValidation | null>(null);
  const [deadlineLoading, setDeadlineLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [milestoneGrades, setMilestoneGrades] = useState<ProjectGrade[]>([]);
  const [finalSubmission, setFinalSubmission] =
    useState<FinalSubmission | null>(null);
  const [gradersInfo, setGradersInfo] = useState<ProjectGradersInfo | null>(
    null
  );
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [updateGroupOpen, setUpdateGroupOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [updateForm] = Form.useForm<{ groupName: string; description?: string }>();
  const [inviteForm] = Form.useForm<{ invitedUserId: number }>();
  const [projectForm] = Form.useForm<{ title: string; description: string; component: string }>();
  const [projectUpdateForm] = Form.useForm<{ title: string; description: string; component: string }>();

  const fetchClassData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const classId = parseInt(id);

      const [classesRes, groupsRes] = await Promise.all([
        getStudentClasses().catch((e: any) => {
          if (e?.response?.status === 401) {
            return { isSuccess: false, data: undefined };
          }
          throw e;
        }),
        getGroupsByClass(classId),
      ]);

      const classData = classesRes.data?.find((c) => c.classId === classId);

      if (!classData) {
        setCls(undefined);
        return;
      }

      const userGroup = groupsRes.data?.find((g) =>
        g.members?.some((m) => m.userId === user?.userId)
      );

      const isUserLeader = userGroup?.leaderId === user?.userId;
      setIsLeader(isUserLeader);

      setCls({
        ...classData,
        myGroup: userGroup
          ? {
              groupId: userGroup.groupId,
              groupName: userGroup.groupName,
            }
          : null,
      });

      if (userGroup) {
        const groupDetailData = await getGroupById(userGroup.groupId);
        setGroupDetail(groupDetailData);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [id, user?.userId]);

  if (!cls) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          type="default"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
          className="mb-4 mb-important"
        >
          Back
        </Button>
        <Empty
          description={
            <span>
              No class data <b>#{id}</b>. Please go back to the list.
            </span>
          }
        />
      </div>
    );
  }

  const onCreate = async (groupName: string, description?: string) => {
    try {
      await createGroup({
        classId: cls!.classId,
        groupName: groupName.trim(),
        description: description?.trim() || undefined,
      });

      // Create chat room for the group
      try {
        const groupsResponse = await getGroupsByClass(parseInt(id!));
        const groups = groupsResponse.data || [];
        const newGroup = groups.find(
          (g: any) => g.groupName === groupName
        );

        if (newGroup) {
          await createChatRoom({
            groupId: newGroup.groupId,
            groupName: newGroup.groupName,
            classId: parseInt(id!),
            className: cls.className,
            members: [
              {
                userId: user!.userId,
                email: user!.email,
                fullName: user!.fullName || '',
                avatarUrl: user!.avatarUrl || '',
                roleInGroup: 'Leader',
              },
            ],
          });
        }
      } catch (chatError) {
        console.error('Error creating chat room:', chatError);
        // Don't block group creation if chat fails
      }

      toast.success("Group created");
      setOpenCreate(false);
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchDeadlineInfo = async () => {
    if (!id) return;
    try {
      setDeadlineLoading(true);
      const classId = parseInt(id);
      const [submissionRes, editPeriodRes] = await Promise.all([
        validateSubmission(classId),
        validateEditPeriod(classId),
      ]);

      if (submissionRes.isSuccess) {
        setSubmissionInfo(submissionRes.data || null);
      }
      if (editPeriodRes.isSuccess) {
        setEditPeriodInfo(editPeriodRes.data || null);
      }
      setOpenDeadlines(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeadlineLoading(false);
    }
  };

  const fetchAllGrades = async () => {
    if (!cls?.myGroup) {
      toast.error("You need to join a group first");
      return;
    }

    try {
      setGradesLoading(true);
      setOpenAllGrades(true);

      const projects = await getProjectByGroup(cls.myGroup.groupId);

      if (!projects || projects.length === 0) {
        toast.error("No project found for your group");
        setMilestoneGrades([]);
        setFinalSubmission(null);
        return;
      }

      const projectId = projects[0].projectId;

      const [gradesRes, finalSubRes, gradersRes] = await Promise.all([
        getProjectGrades(projectId).catch(() => ({
          isSuccess: false,
          data: [],
          message: "",
        })),
        getFinalSubmission(projectId).catch(() => ({
          isSuccess: false,
          data: null,
          message: "",
        })),
        getProjectGraders(projectId).catch(() => ({
          isSuccess: false,
          data: null,
          message: "",
        })),
      ]);

      setMilestoneGrades(gradesRes.data || []);
      setFinalSubmission(finalSubRes.data || null);
      setGradersInfo(gradersRes.data || null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setGradesLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "green";
      case "Late":
        return "orange";
      case "Closed":
        return "red";
      case "NotStarted":
        return "blue";
      case "NotConfigured":
        return "default";
      default:
        return "default";
    }
  };

  const handleKickMember = async (userId: number) => {
    if (!user?.userId || !cls?.myGroup) return;
    try {
      await kickMember({
        groupId: cls.myGroup.groupId,
        targetUserId: userId,
        requesterUserId: user.userId,
      });
      toast.success("Member removed successfully");
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.userId || !cls?.myGroup) return;
    try {
      await leaveGroup({
        groupId: cls.myGroup.groupId,
        userId: user.userId,
      });
      toast.success("You left the group");
      setMembersDrawerOpen(false);
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateGroup = async () => {
    if (!user?.userId || !cls?.myGroup) return;
    try {
      const values = await updateForm.validateFields();
      await updateGroup({
        groupId: cls.myGroup.groupId,
        requesterUserId: user.userId,
        groupName: values.groupName.trim(),
        description: values.description?.trim() || undefined,
      });
      toast.success("Group updated successfully");
      setUpdateGroupOpen(false);
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleInvite = async (selectedUserIds: number[]) => {
    if (!user?.userId || !cls?.myGroup) return;
    try {
      if (selectedUserIds.length === 0) {
        toast.error("No students selected");
        return;
      }
      
      setActionLoading(true);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const userId of selectedUserIds) {
        try {
          await inviteToGroup({
            groupId: cls.myGroup.groupId,
            invitedUserId: userId,
            inviterUserId: user.userId,
          });
          successCount++;
        } catch (e) {
          console.error(`Failed to invite user ${userId}:`, e);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} invitation${successCount > 1 ? 's' : ''} sent successfully`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} invitation${failCount > 1 ? 's' : ''} failed`);
      }
      
      setInviteOpen(false);
      fetchClassData();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchClassData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={fetchAllGrades}
              disabled={!cls?.myGroup}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 !text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award className="w-4 h-4" />
              View Grades
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card
              loading={loading}
              className="shadow-md rounded-xl border-t-4 border-t-blue-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{cls.className}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="blue" className="m-0">{cls.semesterName}</Tag>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{cls.instructorName ?? "—"}</span>
                    </div>
                  </div>
                </div>
                {cls.myGroup && (
                  <div className="flex items-center gap-2">
                    <Badge count={groupDetail?.members?.length || 0} showZero>
                      <button
                        onClick={() => setMembersDrawerOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 !text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        Members
                      </button>
                    </Badge>
                    <ChatButton groupId={cls.myGroup.groupId} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                  <div className="text-xs font-medium text-gray-600 uppercase mb-1">Enrolled</div>
                  <div className="text-sm font-semibold text-gray-900">{formatVietnamTime(cls.enrolledAt, "DD/MM/YYYY")}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                  <div className="text-xs font-medium text-gray-600 uppercase mb-1">My Group</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {cls.myGroup ? cls.myGroup.groupName : "Not joined"}
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                  <div className="text-xs font-medium text-gray-600 uppercase mb-1">Class ID</div>
                  <div className="text-sm font-semibold text-gray-900">#{cls.classId}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={fetchDeadlineInfo}
                  disabled={deadlineLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-all cursor-pointer text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Deadlines
                </button>
                <button
                  onClick={() => setOpenTemplates(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-lg transition-all cursor-pointer text-sm"
                >
                  <Layers className="w-4 h-4" />
                  Templates
                </button>
                <button
                  onClick={() => setOpenSyllabus(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium rounded-lg transition-all cursor-pointer text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Syllabus
                </button>
                {!cls.myGroup && (
                  <button
                    onClick={() => setOpenCreate(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all cursor-pointer text-sm shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Create Group
                  </button>
                )}
              </div>
            </Card>

            {!cls.myGroup && (
              <GroupInvitations onChanged={fetchClassData} classId={cls.classId} />
            )}

            {cls.myGroup && (
              <GroupAndProjectOverview
                classId={cls.classId}
                groupId={cls.myGroup.groupId}
                onChanged={fetchClassData}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-md rounded-xl sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Quick Info
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Instructor</div>
                  <div className="font-semibold text-gray-900">{cls.instructorName ?? "—"}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 mb-1">Semester</div>
                  <div className="font-semibold text-gray-900">{cls.semesterName}</div>
                </div>
                {cls.myGroup ? (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 mb-1">Group Status</div>
                    <div className="font-semibold text-green-600">✓ Member</div>
                  </div>
                ) : (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 mb-1">Group Status</div>
                    <div className="font-semibold text-orange-600">Not joined</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">{groupDetail?.groupName || "Group Members"}</div>
              <div className="text-sm font-normal text-gray-500">{groupDetail?.members?.length || 0} members</div>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setMembersDrawerOpen(false)}
        open={membersDrawerOpen}
        width={420}
        closeIcon={<X className="w-5 h-5" />}
      >
        {groupDetail && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Group Info</h4>
                {isLeader && (
                  <Button
                    size="small"
                    icon={<Pencil className="w-3 h-3" />}
                    onClick={() => {
                      if (groupDetail) {
                        updateForm.setFieldsValue({
                          groupName: groupDetail.groupName,
                          description: groupDetail.description || "",
                        });
                        setUpdateGroupOpen(true);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    Edit
                  </Button>
                )}
              </div>
              {groupDetail.description ? (
                <p className="text-sm text-gray-700 leading-relaxed">{groupDetail.description}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No description</p>
              )}
            </div>

            {isLeader && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (groupDetail) {
                      updateForm.setFieldsValue({
                        groupName: groupDetail.groupName,
                        description: groupDetail.description || "",
                      });
                      setUpdateGroupOpen(true);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 !text-white font-medium rounded-lg transition-all cursor-pointer text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Update
                </button>
                <button
                  onClick={() => {
                    setInviteOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 !text-white font-medium rounded-lg transition-all cursor-pointer text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Members</h4>
              <div className="space-y-2">
                {groupDetail.members.map((member) => (
                  <div
                    key={member.gmId}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar src={member.avatarUrl || undefined} size={40}>
                        {member.fullName?.[0] || member.userId.toString()[0]}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {member.fullName || `User #${member.userId}`}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{member.email || "—"}</div>
                        <Tag
                          color={member.roleInGroup === "Leader" ? "gold" : "blue"}
                          className="mt-1"
                          style={{ fontSize: "10px", padding: "0 4px" }}
                        >
                          {member.roleInGroup}
                        </Tag>
                      </div>
                    </div>
                    {isLeader && member.userId !== user?.userId && (
                      <Popconfirm
                        title="Remove member?"
                        description={`Remove ${member.fullName || member.email || `User #${member.userId}`}?`}
                        okText="Remove"
                        okType="danger"
                        onConfirm={() => handleKickMember(member.userId)}
                      >
                        <Button
                          size="small"
                          danger
                          type="text"
                          icon={<UserMinus className="w-4 h-4" />}
                        />
                      </Popconfirm>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Popconfirm
              title="Leave group?"
              description="Are you sure you want to leave this group?"
              okText="Leave"
              okType="danger"
              onConfirm={handleLeaveGroup}
            >
              <Button
                block
                danger
                type="primary"
                icon={<LogOut className="w-4 h-4" />}
                className="mt-4"
              >
                Leave Group
              </Button>
            </Popconfirm>
          </div>
        )}
      </Drawer>

      <Modal
        open={updateGroupOpen}
        title={
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Update Group</span>
          </div>
        }
        onCancel={() => {
          setUpdateGroupOpen(false);
          updateForm.resetFields();
        }}
        onOk={handleUpdateGroup}
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={updateForm} layout="vertical" className="mt-4">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Please enter group name" }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter group description (optional)" 
            />
          </Form.Item>
        </Form>
      </Modal>

      <CreateGroupModal
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onCreate={onCreate}
      />

      <SyllabusListModal
        open={openSyllabus}
        classId={cls.classId}
        onClose={() => setOpenSyllabus(false)}
      />

      <ProjectTemplateModal
        open={openTemplates}
        classId={cls.classId}
        groupId={cls.myGroup?.groupId || null}
        isLeader={isLeader}
        onClose={() => setOpenTemplates(false)}
        onRegistrationChange={fetchClassData}
      />

      <GroupModals
        inviteOpen={inviteOpen}
        updateOpen={false}
        projectOpen={false}
        projectUpdateOpen={false}
        actionLoading={actionLoading}
        classId={cls.classId}
        inviteForm={inviteForm}
        updateForm={updateForm}
        projectForm={projectForm}
        projectUpdateForm={projectUpdateForm}
        onInviteCancel={() => setInviteOpen(false)}
        onInviteOk={handleInvite}
        onUpdateCancel={() => {}}
        onUpdateOk={() => {}}
        onProjectCreateCancel={() => {}}
        onProjectCreateOk={() => {}}
        onProjectUpdateCancel={() => {}}
        onProjectUpdateOk={() => {}}
      />

      <Modal
        open={openDeadlines}
        title={
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="font-semibold">Class Deadlines & Status</span>
          </div>
        }
        onCancel={() => setOpenDeadlines(false)}
        footer={[
          <Button key="close" onClick={() => setOpenDeadlines(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div className="space-y-6 mt-4">
          <Card title="Submission Period" size="small" className="shadow-sm">
            {submissionInfo ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(submissionInfo.status)}>
                    {submissionInfo.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Can Submit">
                  <Tag color={submissionInfo.canSubmit ? "green" : "red"}>
                    {submissionInfo.canSubmit ? "Yes" : "No"}
                  </Tag>
                </Descriptions.Item>
                {submissionInfo.isLate && (
                  <Descriptions.Item label="Late Submission">
                    <Tag color="orange">Late</Tag>
                  </Descriptions.Item>
                )}
                {submissionInfo.deadlineDate && (
                  <Descriptions.Item label="Deadline">
                    {formatVietnamTime(submissionInfo.deadlineDate)}
                  </Descriptions.Item>
                )}
                {submissionInfo.applicablePenaltyPercent !== null && (
                  <Descriptions.Item label="Late Penalty">
                    {submissionInfo.applicablePenaltyPercent}%
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Message">
                  <span className="text-gray-600">
                    {submissionInfo.message}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="No submission information" />
            )}
          </Card>

          <Card title="Revision Period" size="small" className="shadow-sm">
            {editPeriodInfo ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(editPeriodInfo.status)}>
                    {editPeriodInfo.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Can Edit">
                  <Tag color={editPeriodInfo.canEdit ? "green" : "red"}>
                    {editPeriodInfo.canEdit ? "Yes" : "No"}
                  </Tag>
                </Descriptions.Item>
                {editPeriodInfo.windowStartDate && (
                  <Descriptions.Item label="Start Date">
                    {formatVietnamTime(editPeriodInfo.windowStartDate)}
                  </Descriptions.Item>
                )}
                {editPeriodInfo.windowEndDate && (
                  <Descriptions.Item label="End Date">
                    {formatVietnamTime(editPeriodInfo.windowEndDate)}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Message">
                  <span className="text-gray-600">
                    {editPeriodInfo.message}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="No revision period information" />
            )}
          </Card>
        </div>
      </Modal>

      <Modal
        open={openAllGrades}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">All Grades Overview</span>
          </div>
        }
        style={{ top: 10 }}
        onCancel={() => setOpenAllGrades(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setOpenAllGrades(false)}
          >
            Close
          </Button>,
        ]}
        width={1000}
        loading={gradesLoading}
      >
        <div className="space-y-6">
          <div>
            <Divider
              orientation="left"
              className="text-lg font-semibold text-purple-700"
            >
              Milestone Grades (Grades & Performance)
            </Divider>
            {milestoneGrades.length > 0 ? (
              <Table
                dataSource={milestoneGrades}
                rowKey="meId"
                pagination={false}
                size="middle"
                bordered
                columns={[
                  {
                    title: "Milestone",
                    dataIndex: "milestoneTitle",
                    key: "milestoneTitle",
                    width: 200,
                    render: (text) => (
                      <span className="font-medium">{text}</span>
                    ),
                  },
                  {
                    title: "Instructor",
                    dataIndex: "instructorName",
                    key: "instructorName",
                    width: 150,
                  },
                  {
                    title: "Score",
                    dataIndex: "score",
                    key: "score",
                    width: 100,
                    align: "center",
                    render: (score) => (
                      <Tag
                        color={
                          score >= 70 ? "green" : score >= 50 ? "orange" : "red"
                        }
                      >
                        <span className="font-bold text-base">{score}/100</span>
                      </Tag>
                    ),
                  },
                  {
                    title: "Weight",
                    dataIndex: "weightRatioSnapshot",
                    key: "weightRatioSnapshot",
                    width: 100,
                    align: "center",
                    render: (weight) => (
                      <span>{weight}%</span>
                    ),
                  },
                  {
                    title: "Feedback",
                    dataIndex: "feedback",
                    key: "feedback",
                    ellipsis: true,
                    render: (text) => (
                      <Tooltip title={text}>
                        <span className="text-gray-600">{text || "—"}</span>
                      </Tooltip>
                    ),
                  },
                  {
                    title: "Evaluated At",
                    dataIndex: "evaluatedAt",
                    key: "evaluatedAt",
                    width: 150,
                    render: (date) => formatVietnamTime(date),
                  },
                ]}
              />
            ) : (
              <Empty description="No milestone grades yet" />
            )}
          </div>

          <div>
            <Divider
              orientation="left"
              className="text-lg font-semibold text-indigo-700"
            >
              Final Submission Grade
            </Divider>
            {finalSubmission ? (
              <Card
                size="small"
                className="shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50"
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Status" span={1}>
                    <Tag
                      color={
                        finalSubmission.status === "Submitted"
                          ? "green"
                          : "blue"
                      }
                    >
                      {finalSubmission.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitted At" span={1}>
                    {formatVietnamTime(finalSubmission.submittedAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grade" span={2}>
                    {finalSubmission.grade !== null ? (
                      <Tag
                        color="purple"
                        className="text-lg font-bold px-4 py-1"
                      >
                        {finalSubmission.grade.toFixed(2)}/100
                      </Tag>
                    ) : (
                      <Tag color="default">Not graded yet</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Repository" span={2}>
                    {finalSubmission.repositoryUrl ? (
                      <a
                        href={finalSubmission.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {finalSubmission.repositoryUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ) : (
              <Empty description="No final submission yet" />
            )}
          </div>

          <div>
            <Divider
              orientation="left"
              className="text-lg font-semibold text-amber-700"
            >
              Additional Instructor Evaluations
            </Divider>
            <Card size="small" className="bg-amber-50">
              {gradersInfo && gradersInfo.graders && gradersInfo.graders.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {gradersInfo.totalGradersAssigned}
                      </div>
                      <div className="text-xs text-gray-600">Total Graders</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {gradersInfo.gradersCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      {gradersInfo.averageGrade !== null ? (
                        <>
                          <div className="text-2xl font-bold text-purple-600">
                            {gradersInfo.averageGrade.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600">Average Grade</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-medium text-gray-400">—</div>
                          <div className="text-xs text-gray-500">Not graded yet</div>
                        </>
                      )}
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-orange-600">
                        {gradersInfo.totalGradersAssigned - gradersInfo.gradersCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  <Table
                    dataSource={gradersInfo.graders}
                    rowKey="graderId"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Grader",
                        key: "grader",
                        render: (_: any, record: any) => (
                          <div>
                            <div className="font-medium">{record.graderName}</div>
                            <div className="text-xs text-gray-500">{record.graderEmail}</div>
                          </div>
                        ),
                      },
                      {
                        title: "Status",
                        dataIndex: "status",
                        key: "status",
                        width: 100,
                        render: (status: string) => {
                          const colorMap: Record<string, string> = {
                            Completed: "green",
                            Pending: "orange",
                            NotStarted: "default",
                          };
                          return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
                        },
                      },
                      {
                        title: "Grade",
                        dataIndex: "grade",
                        key: "grade",
                        width: 80,
                        render: (grade: number | null) =>
                          grade !== null ? (
                            <span className="font-semibold text-blue-600">{grade.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          ),
                      },
                      {
                        title: "Graded At",
                        dataIndex: "gradedAt",
                        key: "gradedAt",
                        width: 150,
                        render: (date: string | null) =>
                          date ? dayjs(date).add(7, 'hour').format("DD/MM/YYYY, HH:mm") : "—",
                      },
                      {
                        title: "Feedback",
                        dataIndex: "feedback",
                        key: "feedback",
                        ellipsis: true,
                        render: (feedback: string | null) => feedback || "—",
                      },
                    ]}
                  />
                </div>
              ) : (
                <Empty
                  description={
                    <div className="space-y-2">
                      <p className="text-gray-600 font-medium">
                        No Additional Evaluations Yet
                      </p>
                      <p className="text-gray-500 text-sm">
                        Additional evaluations from other instructors will appear here once assigned.
                      </p>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  );
}
