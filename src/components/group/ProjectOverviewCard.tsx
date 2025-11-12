import { Card, Descriptions, Tag, Typography, Button, Divider } from "antd";
import { FolderOpen, FolderPlus, Pencil } from "lucide-react";
import type { ProjectDetail } from "../../types/project";
import StudentMilestones from "../milestone/StudentMilestones";

interface ProjectOverviewCardProps {
  project: ProjectDetail | null;
  loading: boolean;
  isLeader: boolean;
  canEdit: boolean;
  showMilestones?: boolean;
  onCreateProject: () => void;
  onEditProject: () => void;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved") return "green";
  if (s === "pending") return "blue";
  if (s === "revision") return "orange";
  if (s === "rejected") return "red";
  return "default";
};

export default function ProjectOverviewCard({
  project,
  loading,
  isLeader,
  canEdit,
  showMilestones = false,
  onCreateProject,
  onEditProject,
}: ProjectOverviewCardProps) {
  return (
    <>
      <Card
        loading={loading}
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-600" />
            <span>Project Overview</span>
          </div>
        }
        extra={
          project && isLeader && canEdit && (
            <Button
              type="text"
              icon={<Pencil className="w-4 h-4" />}
              onClick={onEditProject}
            >
              Edit Project
            </Button>
          )
        }
      >
      {project ? (
        <>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
            <Descriptions.Item label="Title" span={2}>
              <Typography.Text strong className="text-base">
                {project.title}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {project.description || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag color={getStatusColor(project.status)} className="text-sm">
                {project.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={1}>
              {new Date(project.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={1}>
              {project.updatedAt
                ? new Date(project.updatedAt).toLocaleDateString()
                : "—"}
            </Descriptions.Item>
          </Descriptions>

          {showMilestones && (
            <>
              <Divider orientation="left" className="mt-6 mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Project Milestones
                </span>
              </Divider>
              <StudentMilestones projectId={project.projectId} isLeader={isLeader} />
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <Typography.Text type="secondary">
            No project found for this group yet.
          </Typography.Text>
          {isLeader && (
            <div className="mt-4">
              <Button
                type="primary"
                icon={<FolderPlus className="w-4 h-4" />}
                onClick={onCreateProject}
              >
                Create Project
              </Button>
            </div>
          )}
        </div>
      )}
      </Card>
    </>
  );
}
