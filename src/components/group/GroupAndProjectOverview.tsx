import { useEffect, useState, useMemo } from "react";
import { Form } from "antd";
import { getGroupById } from "../../api/group";
import { getProjectByGroup, updateProject, deleteProject } from "../../api/project";
import type { GroupDetail } from "../../types/group";
import type { ProjectDetail, UpdateProjectRequest } from "../../types/project";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import {
  inviteToGroup,
  updateGroup,
} from "../../api/group";
import { createProject } from "../../api/project";
import { useAuth } from "../../providers/AuthProvider";
import ProjectOverviewCard from "./ProjectOverviewCard";
import GroupModals from "./GroupModals";

interface GroupAndProjectOverviewProps {
  classId: number;
  groupId: number;
  onChanged?: () => void;
}

export default function GroupAndProjectOverview({
  classId,
  groupId,
  onChanged,
}: GroupAndProjectOverviewProps) {
  const { user } = useAuth();
  const requesterId = user?.userId as number | undefined;

  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectUpdateOpen, setProjectUpdateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [inviteForm] = Form.useForm<{ invitedUserId: number }>();
  const [updateForm] = Form.useForm<{
    groupName: string;
    description?: string;
  }>();
  const [projectForm] = Form.useForm<{ title: string; description: string; component: string }>();
  const [projectUpdateForm] = Form.useForm<{ title: string; description: string; component: string }>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupData, projectData] = await Promise.allSettled([
        getGroupById(groupId),
        getProjectByGroup(groupId),
      ]);

      console.log("Fetched group data:", groupData);

      if (groupData.status === "fulfilled") {
        setDetail(groupData.value);
      }

      if (projectData.status === "fulfilled") {
        setProjects(projectData.value || []);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const isLeader = useMemo(() => {
    if (!detail || !user?.userId) return false;
    return detail.leaderId === user.userId;
  }, [detail, user?.userId]);

  const doInvite = async (selectedUserIds: number[]) => {
    try {
      if (!requesterId) return toast.error("Missing requester");
      if (selectedUserIds.length === 0) return toast.error("No students selected");
      
      setActionLoading(true);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const userId of selectedUserIds) {
        try {
          await inviteToGroup({
            groupId,
            invitedUserId: userId,
            inviterUserId: requesterId,
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
      fetchData();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  // const doKick = async (targetUserId: number) => {
  //   try {
  //     if (!requesterId) return toast.error("Missing requester");
  //     setActionLoading(true);
  //     await kickMember({
  //       groupId,
  //       targetUserId,
  //       requesterUserId: requesterId,
  //     });
  //     toast.success("Member removed");
  //     fetchData();
  //     onChanged?.();
  //   } catch (e) {
  //     toast.error(getErrorMessage(e));
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // const doLeave = async () => {
  //   try {
  //     if (!user?.userId) return toast.error("Missing user");
  //     setActionLoading(true);
  //     await leaveGroup({ groupId, userId: user.userId });
  //     toast.success("You left the group");
  //     onChanged?.();
  //   } catch (e) {
  //     toast.error(getErrorMessage(e));
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const doUpdate = async () => {
    try {
      const v = await updateForm.validateFields();
      if (!requesterId) return toast.error("Missing requester");
      setActionLoading(true);
      const res = await updateGroup({
        groupId,
        requesterUserId: requesterId,
        groupName: v.groupName.trim(),
        description: v.description?.trim() || undefined,
      });
      if (!res.isSuccess) return toast.error(res.message || "Update failed");
      toast.success("Group updated");
      setUpdateOpen(false);
      updateForm.resetFields();
      fetchData();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doCreateProject = async () => {
    try {
      const v = await projectForm.validateFields();
      setActionLoading(true);
      await createProject({
        groupId,
        title: v.title.trim(),
        description: v.description.trim(),
        component: v.component.trim(),
      });

      toast.success("Project created");
      setProjectOpen(false);
      projectForm.resetFields();
      fetchData();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doUpdateProject = async () => {
    if (!selectedProjectId || !requesterId) return;
    try {
      const v = await projectUpdateForm.validateFields();
      setActionLoading(true);
      
      const payload: UpdateProjectRequest = {
        projectId: selectedProjectId,
        requesterUserId: requesterId,
        title: v.title.trim(),
        description: v.description.trim(),
        component: v.component.trim(),
      };
      
      await updateProject(payload);

      toast.success("Project updated successfully");
      setProjectUpdateOpen(false);
      projectUpdateForm.resetFields();
      
      setProjects(projects.map(p => 
        p.projectId === selectedProjectId
          ? { ...p, title: payload.title, description: payload.description, component: payload.component }
          : p
      ));
      setSelectedProjectId(null);
      
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doDeleteProject = async (projectId: number) => {
    try {
      setActionLoading(true);
      const res = await deleteProject(projectId);
      
      if (res.isSuccess) {
        toast.success("Project deleted successfully");
        setProjects(projects.filter(p => p.projectId !== projectId));
        fetchData();
        onChanged?.();
      } else {
        toast.error(res.message || "Failed to delete project");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const canEditProject = useMemo(() => {
    return true;
  }, []);

  const canCreateProject = useMemo(() => {
    if (projects.length === 0) return true;
    
    const allRejected = projects.every(
      p => p.status.toLowerCase() === 'rejected'
    );
    return allRejected;
  }, [projects]);

  return (
    <div className="space-y-6 mt-4">
      <ProjectOverviewCard
        projects={projects}
        loading={loading}
        isLeader={isLeader}
        canEdit={canEditProject}
        canCreateProject={canCreateProject}
        showMilestones={true}
        onCreateProject={() => setProjectOpen(true)}
        onEditProject={(projectId: number) => {
          const project = projects.find(p => p.projectId === projectId);
          if (project) {
            setSelectedProjectId(projectId);
            projectUpdateForm.setFieldsValue({
              title: project.title,
              description: project.description || undefined,
              component: project.component || undefined,
            });
            setProjectUpdateOpen(true);
          }
        }}
        onDeleteProject={doDeleteProject}
      />

      <GroupModals
        inviteOpen={inviteOpen}
        updateOpen={updateOpen}
        projectOpen={projectOpen}
        projectUpdateOpen={projectUpdateOpen}
        actionLoading={actionLoading}
        classId={classId}
        inviteForm={inviteForm}
        updateForm={updateForm}
        projectForm={projectForm}
        projectUpdateForm={projectUpdateForm}
        onInviteCancel={() => {
          setInviteOpen(false);
        }}
        onInviteOk={doInvite}
        onUpdateCancel={() => {
          setUpdateOpen(false);
          updateForm.resetFields();
        }}
        onUpdateOk={doUpdate}
        onProjectCreateCancel={() => {
          setProjectOpen(false);
          projectForm.resetFields();
        }}
        onProjectCreateOk={doCreateProject}
        onProjectUpdateCancel={() => {
          setProjectUpdateOpen(false);
          projectUpdateForm.resetFields();
        }}
        onProjectUpdateOk={doUpdateProject}
      />
    </div>
  );
}
