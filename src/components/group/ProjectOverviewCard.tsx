import { useState } from "react";
import { Card, Descriptions, Tag, Typography, Button, Divider } from "antd";
import { FolderOpen, FolderPlus, Pencil, History } from "lucide-react";
import type { ProjectDetail } from "../../types/project";
import StudentMilestones from "../milestone/StudentMilestones";
import FinalSubmissionCard from "../finalSubmission/FinalSubmissionCard";
import ProjectGradesCard from "../project/ProjectGradesCard";
import { ProjectStatusHistoryModal } from "../project/ProjectStatusHistory";

interface ProjectOverviewCardProps {
  projects: ProjectDetail[];
  loading: boolean;
  isLeader: boolean;
  canEdit: boolean;
  canCreateProject: boolean;
  showMilestones?: boolean;
  onCreateProject: () => void;
  onEditProject: (projectId: number) => void;
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
  projects,
  loading,
  isLeader,
  canEdit,
  canCreateProject,
  showMilestones = false,
  onCreateProject,
  onEditProject,
}: ProjectOverviewCardProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(
    null
  );

  return (
    <>
      <Card
        loading={loading}
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-green-600" />
            <span>Projects ({projects.length})</span>
          </div>
        }
        extra={
          isLeader &&
          canCreateProject && (
            <Button
              type="primary"
              icon={<FolderPlus className="w-4 h-4" />}
              onClick={onCreateProject}
            >
              Create New Project
            </Button>
          )
        }
      >
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => {
              const projectCanEdit =
                canEdit &&
                project.status.toLowerCase() !== "approved" &&
                project.status.toLowerCase() !== "rejected";
              return (
                <Card
                  key={project.projectId}
                  type="inner"
                  className="shadow-sm"
                  title={
                    <div className="flex items-center justify-between">
                      <Typography.Text strong className="text-base">
                        {project.title}
                      </Typography.Text>
                      <div className="flex items-center gap-2">
                        <Button
                          type="default"
                          size="small"
                          icon={<History className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setHistoryModalOpen(true);
                          }}
                        >
                          History
                        </Button>
                        {isLeader && projectCanEdit && (
                          <Button
                            type="text"
                            size="small"
                            icon={<Pencil className="w-4 h-4" />}
                            onClick={() => onEditProject(project.projectId)}
                          >
                            Edit
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
                    {project.purpose && (
                      <Descriptions.Item label="Purpose" span={2}>
                        {project.purpose}
                      </Descriptions.Item>
                    )}
                    {project.expectedTechnology && (
                      <Descriptions.Item label="Expected Technology" span={2}>
                        {project.expectedTechnology}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Status" span={1}>
                      <Tag
                        color={getStatusColor(project.status)}
                        className="text-sm"
                      >
                        {project.status.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At" span={1}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At" span={2}>
                      {project.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString()
                        : "—"}
                    </Descriptions.Item>
                  </Descriptions>

                  {showMilestones && (
                    <>
                      <Divider orientation="left" className="mt-4 mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          Project Milestones
                        </span>
                      </Divider>
                      <StudentMilestones
                        projectId={project.projectId}
                        isLeader={isLeader}
                      />

                      <Divider orientation="left" className="mt-4 mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          Grades & Performance
                        </span>
                      </Divider>
                      <ProjectGradesCard
                        projectId={project.projectId}
                        role="student"
                      />

                      <Divider orientation="left" className="mt-4 mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          Final Submission
                        </span>
                      </Divider>
                      <FinalSubmissionCard
                        projectId={project.projectId}
                        isLeader={isLeader}
                      />
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <Typography.Text type="secondary">
              No project found for this group yet.
            </Typography.Text>
            {isLeader && canCreateProject && (
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

      {selectedProject && (
        <ProjectStatusHistoryModal
          projectId={selectedProject.projectId}
          projectTitle={selectedProject.title}
          open={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </>
  );
}
