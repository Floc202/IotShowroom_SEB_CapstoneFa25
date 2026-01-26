import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Avatar,
  Divider,
  Spin,
  AutoComplete,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Pencil,
  FolderOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  History,
} from "lucide-react";
import {
  getClassGroups,
  updateGroupAsInstructor,
  addMemberToGroup,
  removeMemberFromGroup,
  updateMemberRole,
  getUnassignedStudents,
} from "../../api/instructor";
import { getProjectByGroup } from "../../api/project";
import { updateProjectStatus } from "../../api/project";
import { getSimulationsByProject } from "../../api/simulation";
import type { SimulationItem } from "../../api/simulation";
import type {
  InstructorGroupDetail,
  InstructorGroupMember,
  UpdateGroupRequest,
  UnassignedStudent,
} from "../../types/instructor";
import type {
  ProjectDetail,
  UpdateProjectStatusRequest,
} from "../../types/project";
import InstructorMilestones from "../../components/milestone/InstructorMilestones";
import FinalSubmissionView from "../../components/finalSubmission/FinalSubmissionView";
import { ProjectStatusHistoryModal } from "../../components/project/ProjectStatusHistory";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../providers/AuthProvider";

export default function InstructorGroupDetail() {
  const { classId, groupId } = useParams<{
    classId: string;
    groupId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<InstructorGroupDetail | null>(null);
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [simulations, setSimulations] = useState<
    Record<number, SimulationItem[]>
  >({});
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>("");
  const [selectLeaderModalOpen, setSelectLeaderModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<number | null>(null);
  const [newLeaderId, setNewLeaderId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<UnassignedStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<UnassignedStudent[]>(
    []
  );
  const debounceTimer = useRef<number | null>(null);

  const [editForm] = Form.useForm<UpdateGroupRequest>();
  const [statusForm] = Form.useForm<{ status: string; comment: string }>();

  useEffect(() => {
    if (classId && groupId) {
      const cId = parseInt(classId);
      const gId = parseInt(groupId);
      (async () => {
        try {
          setLoading(true);

          const groupData = await getClassGroups(cId);
          const foundGroup = groupData.data?.find((g) => g.groupId === gId);

          if (foundGroup) {
            setGroup(foundGroup);
            const projectRes = await getProjectByGroup(gId);

            if (projectRes && projectRes.length > 0) {
              const simulationsMap: Record<number, SimulationItem[]> = {};
              for (const project of projectRes) {
                try {
                  const simRes = await getSimulationsByProject(
                    project.projectId
                  );
                  if (simRes.data.isSuccess && simRes.data.data) {
                    simulationsMap[project.projectId] = simRes.data.data.filter(
                      (sim) => sim.status === "submitted"
                    );
                  }
                } catch (e) {
                  console.error(
                    `Failed to fetch simulations for project ${project.projectId}:`,
                    e
                  );
                }
              }
              setSimulations(simulationsMap);
            }
            setProjects(projectRes || []);
          }
        } catch (e) {
          toast.error(getErrorMessage(e));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [classId, groupId]);

  useEffect(() => {
    if (!addMemberModalOpen) {
      setStudents([]);
      setSearchQuery("");
      setSelectedStudents([]);
    }
  }, [addMemberModalOpen]);

  const searchStudents = async (query: string) => {
    if (!classId || !query.trim()) {
      setStudents([]);
      return;
    }

    try {
      setSearching(true);
      const res = await getUnassignedStudents(parseInt(classId), query);
      const results = res.data?.students || [];
      const filtered = results.filter(
        (s) => !selectedStudents.some((sel) => sel.userId === s.userId)
      );
      setStudents(filtered);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchStudents(value);
    }, 300);
  };

  const handleSelect = (_value: string, option: any) => {
    const student = students.find((s) => s.userId === option.key);
    if (student && !selectedStudents.some((s) => s.userId === student.userId)) {
      setSelectedStudents([...selectedStudents, student]);
      setSearchQuery("");
      setStudents([]);
    }
  };

  const handleRemoveStudent = (userId: number) => {
    setSelectedStudents(selectedStudents.filter((s) => s.userId !== userId));
  };

  const handleUpdateGroup = async () => {
    if (!groupId || !group) return;
    try {
      const values = await editForm.validateFields();
      const res = await updateGroupAsInstructor(parseInt(groupId), values);

      if (!res.isSuccess) {
        toast.error(res.message || "Update failed");
        return;
      }

      toast.success("Group updated successfully");
      setEditModalOpen(false);

      setGroup({
        ...group,
        groupName: values.groupName || group.groupName,
        description: values.description || group.description,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleAddMember = async () => {
    if (!groupId || !group || !classId) return;
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const student of selectedStudents) {
        try {
          const res = await addMemberToGroup(parseInt(groupId), {
            userId: student.userId,
            roleInGroup: "Member",
          });

          if (res.isSuccess) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          console.error(`Failed to add user ${student.userId}:`, e);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} member${
            successCount > 1 ? "s" : ""
          } added successfully`
        );
      }
      if (failCount > 0) {
        toast.error(
          `${failCount} member${failCount > 1 ? "s" : ""} failed to add`
        );
      }

      setAddMemberModalOpen(false);
      setSelectedStudents([]);
      setSearchQuery("");

      const cId = parseInt(classId);
      const gId = parseInt(groupId);
      const groupData = await getClassGroups(cId);
      const foundGroup = groupData.data?.find((g) => g.groupId === gId);

      if (foundGroup) {
        setGroup(foundGroup);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!groupId || !group) return;
    try {
      const res = await removeMemberFromGroup(parseInt(groupId), userId);

      if (!res.isSuccess) {
        toast.error(res.message || "Remove failed");
        return;
      }

      toast.success("Member removed successfully");

      setGroup({
        ...group,
        members: group.members.filter((m) => m.userId !== userId),
        memberCount: group.memberCount - 1,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    if (!groupId || !group) return;

    const currentMember = group.members.find((m) => m.userId === userId);
    if (!currentMember) return;

    const currentRole = currentMember.roleInGroup;

    if (currentRole === "Member" && newRole === "Leader") {
      const existingLeader = group.members.find(
        (m) => m.userId !== userId && m.roleInGroup === "Leader"
      );
      if (existingLeader) {
        toast.error(
          `Cannot change role: ${existingLeader.fullName} is already the Leader of this group`
        );
        return;
      }
    }

    if (currentRole === "Leader" && newRole === "Member") {
      const otherLeaders = group.members.filter(
        (m) => m.userId !== userId && m.roleInGroup === "Leader"
      );

      if (otherLeaders.length === 0) {
        const eligibleMembers = group.members.filter(
          (m) => m.userId !== userId
        );

        if (eligibleMembers.length === 0) {
          toast.error("Cannot demote: No other members to promote as Leader");
          return;
        }

        setTargetMemberId(userId);
        setSelectLeaderModalOpen(true);
        return;
      }
    }

    try {
      const res = await updateMemberRole(parseInt(groupId), userId, {
        roleInGroup: newRole,
      });

      if (!res.isSuccess) {
        toast.error(res.message || "Update role failed");
        return;
      }

      toast.success("Role updated successfully");

      setGroup({
        ...group,
        members: group.members.map((m) =>
          m.userId === userId ? { ...m, roleInGroup: newRole } : m
        ),
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleConfirmLeaderChange = async () => {
    if (!groupId || !group || !targetMemberId || !newLeaderId) return;

    try {
      const promoteRes = await updateMemberRole(parseInt(groupId), newLeaderId, {
        roleInGroup: "Leader",
      });

      if (!promoteRes.isSuccess) {
        toast.error(promoteRes.message || "Failed to promote new Leader");
        return;
      }

      const demoteRes = await updateMemberRole(parseInt(groupId), targetMemberId, {
        roleInGroup: "Member",
      });

      if (!demoteRes.isSuccess) {
        toast.error(demoteRes.message || "Failed to demote current Leader");
        return;
      }

      toast.success("Leader changed successfully");

      setGroup({
        ...group,
        members: group.members.map((m) => {
          if (m.userId === newLeaderId) return { ...m, roleInGroup: "Leader" };
          if (m.userId === targetMemberId) return { ...m, roleInGroup: "Member" };
          return m;
        }),
      });

      setSelectLeaderModalOpen(false);
      setTargetMemberId(null);
      setNewLeaderId(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateProjectStatus = async () => {
    if (!selectedProjectId || !user?.userId) return;
    
    const currentProject = projects.find(p => p.projectId === selectedProjectId);
    if (currentProject?.status.toLowerCase() === "approved") {
      toast.error("Cannot update status: Project is already approved");
      return;
    }
    
    try {
      const values = await statusForm.validateFields();
      const payload: UpdateProjectStatusRequest = {
        projectId: selectedProjectId,
        instructorId: user.userId,
        status: values.status,
        comment: values.comment,
      };

      await updateProjectStatus(payload);

      toast.success("Project status updated successfully");
      setStatusModalOpen(false);
      statusForm.resetFields();

      setProjects(
        projects.map((p) =>
          p.projectId === selectedProjectId
            ? { ...p, status: values.status }
            : p
        )
      );
      setSelectedProjectId(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const memberColumns: ColumnsType<InstructorGroupMember> = [
    {
      title: "Member",
      key: "member",
      render: (_: any, record: InstructorGroupMember) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} src={record.avatarUrl}>
            {record.fullName?.[0]}
          </Avatar>
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "roleInGroup",
      key: "roleInGroup",
      width: 150,
      render: (role: string, record: InstructorGroupMember) => (
        <Select
          value={role}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateRole(record.userId, value)}
          options={[
            { label: "Leader", value: "Leader" },
            { label: "Member", value: "Member" },
          ]}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: InstructorGroupMember) => (
        <Popconfirm
          title="Remove this member?"
          description={`Remove ${record.fullName}?`}
          onConfirm={() => handleRemoveMember(record.userId)}
        >
          <Button danger size="small" icon={<UserMinus className="w-4 h-4" />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "blue";
      case "approved":
        return "green";
      case "revision":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Space className="w-full justify-between">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Space>

      <Card
        loading={loading}
        title={
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">{group?.groupName}</span>
          </div>
        }
        extra={
          <Button
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => {
              if (group) {
                editForm.setFieldsValue({
                  groupName: group.groupName,
                  description: group.description || "",
                });
              }
              setEditModalOpen(true);
            }}
          >
            Edit Group
          </Button>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Class">
            {group?.className}
          </Descriptions.Item>
          <Descriptions.Item label="Leader">
            {group?.leaderName}
          </Descriptions.Item>
          <Descriptions.Item label="Members">
            <Tag color="blue">{group?.memberCount}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Projects">
            <Tag color="purple">{group?.projectCount}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {group?.createdAt
              ? new Date(
                  new Date(group.createdAt).getTime() + 7 * 60 * 60 * 1000
                ).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {group?.description || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        loading={loading}
        title="Group Members"
        extra={
          <Button
            type="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setAddMemberModalOpen(true)}
          >
            Add Member
          </Button>
        }
      >
        <Table<InstructorGroupMember>
          rowKey="userId"
          columns={memberColumns}
          dataSource={group?.members || []}
          pagination={false}
        />
      </Card>

      <Card
        loading={loading}
        title={
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-600" />
            <span>Projects ({projects.length})</span>
          </div>
        }
      >
        {projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map((project) => (
              <Card
                key={project.projectId}
                type="inner"
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-base">
                      {project.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        icon={<History className="w-4 h-4" />}
                        onClick={() => {
                          setSelectedProjectId(project.projectId);
                          setSelectedProjectTitle(project.title);
                          setHistoryModalOpen(true);
                        }}
                      >
                        History
                      </Button>
                      {project.status.toLowerCase() !== "approved" && (
                        <Button
                          type="primary"
                          size="small"
                          icon={getStatusIcon(project.status)}
                          onClick={() => {
                            setSelectedProjectId(project.projectId);
                            statusForm.setFieldsValue({
                              status: project.status,
                              comment: "",
                            });
                            setStatusModalOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                }
              >
                <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Description" span={2}>
                    {project.description || "—"}
                  </Descriptions.Item>
                  {project.component && (
                    <Descriptions.Item label="Component" span={2}>
                      {project.component}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Status">
                    <Tag
                      color={getStatusColor(project.status)}
                      icon={getStatusIcon(project.status)}
                    >
                      {project.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Created">
                    {new Date(
                      new Date(project.createdAt).getTime() + 7 * 60 * 60 * 1000
                    ).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated">
                    {project.updatedAt
                      ? new Date(
                          new Date(project.updatedAt).getTime() +
                            7 * 60 * 60 * 1000
                        ).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "—"}
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left" className="mt-6 mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Milestones Management
                  </span>
                </Divider>

                <InstructorMilestones projectId={project.projectId} />

                <Divider orientation="left" className="mt-6 mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    IoT Simulations (Submitted)
                  </span>
                </Divider>

                {simulations[project.projectId] &&
                simulations[project.projectId].length > 0 ? (
                  <div className="space-y-3">
                    {simulations[project.projectId].map((sim) => (
                      <Card
                        key={sim.simulationId}
                        type="inner"
                        size="small"
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-base">
                                {sim.title}
                              </span>
                              <Tag color="blue">SUBMITTED</Tag>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {sim.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              <span>
                                Created:{" "}
                                {new Date(
                                  new Date(sim.createdAt).getTime() +
                                    7 * 60 * 60 * 1000
                                ).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </span>
                              {sim.updatedAt && (
                                <span>
                                  Updated:{" "}
                                  {new Date(
                                    new Date(sim.updatedAt).getTime() +
                                      7 * 60 * 60 * 1000
                                  ).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              navigate(
                                `/instructor/classes/${classId}/groups/${groupId}/simulation?projectId=${project.projectId}&simulationId=${sim.simulationId}`
                              );
                            }}
                          >
                            View Simulation
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No submitted simulations yet
                  </div>
                )}

                <Divider orientation="left" className="mt-6 mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Final Submission
                  </span>
                </Divider>

                <FinalSubmissionView
                  projectId={project.projectId}
                  role="instructor"
                />

                {/* <Divider orientation="left" className="mt-6 mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Grading Overview
                  </span>
                </Divider>

                <ProjectGradesCard
                  projectId={project.projectId}
                  role="instructor"
                /> */}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No project found for this group</p>
          </div>
        )}
      </Card>

      <Modal
        open={editModalOpen}
        title="Edit Group"
        onCancel={() => setEditModalOpen(false)}
        onOk={handleUpdateGroup}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={addMemberModalOpen}
        title={
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Add Members to Group</span>
          </div>
        }
        onCancel={() => {
          setAddMemberModalOpen(false);
          setSelectedStudents([]);
          setSearchQuery("");
        }}
        onOk={handleAddMember}
        width={600}
        okText="Add Members"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search and add students
            </label>
            <AutoComplete
              value={searchQuery}
              onChange={handleSearch}
              onSelect={handleSelect}
              options={students.map((student) => ({
                key: student.userId,
                value: student.email,
                label: (
                  <div className="flex items-center gap-3 py-2">
                    <Avatar size={32} src={student.avatarUrl}>
                      {student.fullName[0]}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{student.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </div>
                ),
              }))}
              notFoundContent={
                searching ? (
                  <div className="text-center py-4">
                    <Spin size="small" />
                    <div className="text-xs text-gray-500 mt-2">
                      Searching...
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No students found
                  </div>
                ) : null
              }
              className="w-full"
            >
              <Input
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                placeholder="Type name or email to search..."
                size="large"
              />
            </AutoComplete>
          </div>

          {selectedStudents.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected students ({selectedStudents.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {selectedStudents.map((student) => (
                  <Tag
                    key={student.userId}
                    closable
                    onClose={() => handleRemoveStudent(student.userId)}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <Avatar size={20} src={student.avatarUrl}>
                      {student.fullName[0]}
                    </Avatar>
                    <span>{student.fullName}</span>
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={statusModalOpen}
        title="Update Project Status"
        onCancel={() => setStatusModalOpen(false)}
        onOk={handleUpdateProjectStatus}
        width={600}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: "Required" }]}
          >
            <Select
              options={[
                { label: "Approved", value: "Approved" },
                { label: "Revision", value: "Revision" },
                { label: "Rejected", value: "Rejected" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ required: true, message: "Please provide feedback" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Provide feedback for the group..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {selectedProjectId && (
        <ProjectStatusHistoryModal
          projectId={selectedProjectId}
          projectTitle={selectedProjectTitle}
          open={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedProjectId(null);
            setSelectedProjectTitle("");
          }}
        />
      )}

      <Modal
        open={selectLeaderModalOpen}
        title="Select New Leader"
        onCancel={() => {
          setSelectLeaderModalOpen(false);
          setTargetMemberId(null);
          setNewLeaderId(null);
        }}
        onOk={handleConfirmLeaderChange}
        okText="Confirm"
        okButtonProps={{ disabled: !newLeaderId }}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            To ensure the group always has a Leader, please select a member to
            become the new Leader before demoting the current Leader.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">
              Select New Leader
            </label>
            <Select
              placeholder="Choose a member to promote"
              value={newLeaderId}
              onChange={setNewLeaderId}
              className="w-full"
              size="large"
            >
              {group?.members
                .filter((m) => m.userId !== targetMemberId)
                .map((member) => (
                  <Select.Option key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar size={24} src={member.avatarUrl}>
                        {member.fullName[0]}
                      </Avatar>
                      <span>{member.fullName}</span>
                      <span className="text-xs text-gray-500">
                        ({member.email})
                      </span>
                    </div>
                  </Select.Option>
                ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
