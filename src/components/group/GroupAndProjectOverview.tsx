import { useEffect, useState, useMemo } from "react";
import { Form } from "antd";
import { getGroupById } from "../../api/group";
import { getProjectByGroup, updateProject } from "../../api/project";
import type { GroupDetail } from "../../types/group";
import type { ProjectDetail, UpdateProjectRequest } from "../../types/project";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import {
  inviteToGroup,
  kickMember,
  leaveGroup,
  updateGroup,
} from "../../api/group";
import { createProject } from "../../api/project";
import { useAuth } from "../../providers/AuthProvider";
import GroupOverviewCard from "./GroupOverviewCard";
import ProjectOverviewCard from "./ProjectOverviewCard";
import GroupModals from "./GroupModals";

interface GroupAndProjectOverviewProps {
  classId: number;
  groupId: number;
  onChanged?: () => void;
}

export default function GroupAndProjectOverview({
  groupId,
  onChanged,
}: GroupAndProjectOverviewProps) {
  const { user } = useAuth();
  const requesterId = user?.userId as number | undefined;

  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectUpdateOpen, setProjectUpdateOpen] = useState(false);

  const [inviteForm] = Form.useForm<{ invitedUserId: number }>();
  const [updateForm] = Form.useForm<{
    groupName: string;
    description?: string;
  }>();
  const [projectForm] = Form.useForm<{ title: string; description?: string }>();
  const [projectUpdateForm] = Form.useForm<{ title: string; description?: string }>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupData, projectData] = await Promise.allSettled([
        getGroupById(groupId),
        getProjectByGroup(groupId),
      ]);

      if (groupData.status === "fulfilled") {
        setDetail(groupData.value);
      }

      if (projectData.status === "fulfilled") {
        setProject(projectData.value);
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

  const doInvite = async () => {
    try {
      const v = await inviteForm.validateFields();
      if (!requesterId) return toast.error("Missing requester");
      setActionLoading(true);
      await inviteToGroup({
        groupId,
        invitedUserId: v.invitedUserId,
        inviterUserId: requesterId,
      });
      toast.success("Invitation sent");
      setInviteOpen(false);
      inviteForm.resetFields();
      fetchData();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doKick = async (targetUserId: number) => {
    try {
      if (!requesterId) return toast.error("Missing requester");
      setActionLoading(true);
      await kickMember({
        groupId,
        targetUserId,
        requesterUserId: requesterId,
      });
      toast.success("Member removed");
      fetchData();
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doLeave = async () => {
    try {
      if (!user?.userId) return toast.error("Missing user");
      setActionLoading(true);
      await leaveGroup({ groupId, userId: user.userId });
      toast.success("You left the group");
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

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
        description: v.description?.trim() || "",
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
    if (!project || !requesterId) return;
    try {
      const v = await projectUpdateForm.validateFields();
      setActionLoading(true);
      
      const payload: UpdateProjectRequest = {
        projectId: project.projectId,
        requesterUserId: requesterId,
        title: v.title.trim(),
        description: v.description?.trim() || "",
      };
      
      await updateProject(payload);

      toast.success("Project updated successfully");
      setProjectUpdateOpen(false);
      projectUpdateForm.resetFields();
      
      setProject({
        ...project,
        title: payload.title,
        description: payload.description,
      });
      
      onChanged?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const canEditProject = useMemo(() => {
    if (!project) return false;
    const status = project.status.toLowerCase();
    return status === 'approved' || status === 'revision';
  }, [project]);

  return (
    <div className="space-y-6">
      {detail && (
        <GroupOverviewCard
          detail={detail}
          loading={loading}
          isLeader={isLeader}
          currentUserId={user?.userId}
          onInvite={() => setInviteOpen(true)}
          onUpdate={() => {
            updateForm.setFieldsValue({
              groupName: detail.groupName,
              description: detail.description || "",
            });
            setUpdateOpen(true);
          }}
          onKick={doKick}
          onLeave={doLeave}
        />
      )}

      <ProjectOverviewCard
        project={project}
        loading={loading}
        isLeader={isLeader}
        canEdit={canEditProject}
        showMilestones={true}
        onCreateProject={() => setProjectOpen(true)}
        onEditProject={() => {
          if (project) {
            projectUpdateForm.setFieldsValue({
              title: project.title,
              description: project.description || undefined,
            });
            setProjectUpdateOpen(true);
          }
        }}
      />

      <GroupModals
        inviteOpen={inviteOpen}
        updateOpen={updateOpen}
        projectOpen={projectOpen}
        projectUpdateOpen={projectUpdateOpen}
        actionLoading={actionLoading}
        inviteForm={inviteForm}
        updateForm={updateForm}
        projectForm={projectForm}
        projectUpdateForm={projectUpdateForm}
        onInviteCancel={() => {
          setInviteOpen(false);
          inviteForm.resetFields();
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
