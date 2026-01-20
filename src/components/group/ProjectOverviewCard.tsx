import { useState } from "react";
import { Card, Tag, Button, Collapse, Tabs, Popconfirm } from "antd";
import { FolderOpen, FolderPlus, Pencil, History, Trash2, FileText, Layers, Upload, Award } from "lucide-react";
import type { ProjectDetail } from "../../types/project";
import StudentMilestones from "../milestone/StudentMilestones";
import FinalSubmissionCard from "../finalSubmission/FinalSubmissionCard";
import ProjectGradesCard from "../project/ProjectGradesCard";
import SimulationCard from "../simulation/SimulationCard";
import { ProjectStatusHistoryModal } from "../project/ProjectStatusHistory";
import { formatVietnamTime } from "../../utils/helpers";

const { Panel } = Collapse;

interface ProjectOverviewCardProps {
  projects: ProjectDetail[];
  loading: boolean;
  isLeader: boolean;
  canEdit: boolean;
  canCreateProject: boolean;
  showMilestones?: boolean;
  onCreateProject: () => void;
  onEditProject: (projectId: number) => void;
  onDeleteProject?: (projectId: number) => void;
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
  onDeleteProject,
}: ProjectOverviewCardProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);

  return (
    <>
      <Card
        loading={loading}
        className="shadow-md rounded-xl border-l-4 border-l-purple-500"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Projects {projects.length > 0 && `(${projects.length})`}
            </h3>
          </div>
          {isLeader && canCreateProject && (
            <button
              onClick={onCreateProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>

        {projects.length > 0 ? (
          <Collapse
            accordion
            defaultActiveKey={projects[0]?.projectId}
            className="bg-transparent border-none"
          >
            {projects.map((project) => {
              const projectCanEdit =
                canEdit &&
                project.status.toLowerCase() !== "approved" 

              return (
                <Panel
                  key={project.projectId}
                  header={
                    <div className="flex items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <Tag color={getStatusColor(project.status)} className="m-0">
                          {project.status}
                        </Tag>
                        <span className="font-semibold text-gray-900">{project.title}</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<History className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setHistoryModalOpen(true);
                          }}
                          className="cursor-pointer"
                        />
                        {isLeader && projectCanEdit && (
                          <>
                            <Button
                              type="text"
                              size="small"
                              icon={<Pencil className="w-4 h-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProject(project.projectId);
                              }}
                              className="cursor-pointer"
                            />
                            {onDeleteProject && (
                              <Popconfirm
                                title="Delete Project"
                                description={`Are you sure you want to delete "${project.title}"?`}
                                onConfirm={(e) => {
                                  e?.stopPropagation();
                                  onDeleteProject(project.projectId);
                                }}
                                okText="Delete"
                                okType="danger"
                                cancelText="Cancel"
                                onCancel={(e) => e?.stopPropagation()}
                              >
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<Trash2 className="w-4 h-4" />}
                                  onClick={(e) => e.stopPropagation()}
                                  className="cursor-pointer"
                                />
                              </Popconfirm>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  }
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Description</div>
                        <div className="text-sm text-gray-900">{project.description || "—"}</div>
                      </div>
                      {project.component && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Component</div>
                          <div className="text-sm text-gray-900">{project.component}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Created</div>
                        <div className="text-sm text-gray-900">{formatVietnamTime(project.createdAt, "DD/MM/YYYY")}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Updated</div>
                        <div className="text-sm text-gray-900">
                          {project.updatedAt ? formatVietnamTime(project.updatedAt, "DD/MM/YYYY") : "—"}
                        </div>
                      </div>
                    </div>

                    {showMilestones && (
                      <Tabs
                        defaultActiveKey="milestones"
                        items={[
                          {
                            key: "milestones",
                            label: (
                              <span className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Milestones
                              </span>
                            ),
                            children: (
                              <div className="py-2">
                                <StudentMilestones
                                  projectId={project.projectId}
                                  isLeader={isLeader}
                                />
                              </div>
                            ),
                          },
                          {
                            key: "simulations",
                            label: (
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Simulations
                              </span>
                            ),
                            children: (
                              <div className="py-2">
                                <SimulationCard
                                  projectId={project.projectId}
                                  isLeader={isLeader}
                                />
                              </div>
                            ),
                          },
                          {
                            key: "submission",
                            label: (
                              <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Final Submission
                              </span>
                            ),
                            children: (
                              <div className="py-2">
                                <FinalSubmissionCard
                                  projectId={project.projectId}
                                  isLeader={isLeader}
                                />
                              </div>
                            ),
                          },
                          {
                            key: "grades",
                            label: (
                              <span className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Grades
                              </span>
                            ),
                            children: (
                              <div className="py-2">
                                <ProjectGradesCard
                                  projectId={project.projectId}
                                  role="student"
                                />
                              </div>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                </Panel>
              );
            })}
          </Collapse>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">No Projects Yet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Create your first project to get started
            </p>
            {isLeader && canCreateProject && (
              <button
                onClick={onCreateProject}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                Create Project
              </button>
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
