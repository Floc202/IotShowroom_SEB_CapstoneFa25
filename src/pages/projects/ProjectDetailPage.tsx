import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Users, Cpu, Wifi, Code, FileText, 
  Presentation, Video, Github, Star, Award, Calendar,
  ExternalLink, TrendingUp, Zap, Radio
} from "lucide-react";
import { getProjectsBySemester } from "../../api/project";
import type { SemesterProjectDetail } from "../../types/project";
import { getErrorMessage, formatVietnamTime } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<SemesterProjectDetail | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const mockSemesterId = 1;
        const res = await getProjectsBySemester(mockSemesterId);
        if (res.isSuccess && res.data) {
          const foundProject = res.data.projects.find(
            (p) => p.projectId.toString() === id && 
                   p.status.toLowerCase() === "approved" &&
                   (p.finalSubmission?.instructorGrade !== null && p.finalSubmission?.instructorGrade !== undefined)
          );
          if (foundProject) {
            setProject(foundProject);
          } else {
            toast.error("Project not found or not available");
            navigate("/");
          }
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The project you're looking for doesn't exist or is not available.</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "team", label: "Team", icon: Users },
    { key: "simulation", label: "Live Demo", icon: Radio },
    // { key: "submission", label: "Submission", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Projects</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-blue-100">
                    {project.className} • {project.groupName}
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                <p className="text-blue-100 text-sm max-w-3xl line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
                  <Users className="w-3 h-3" />
                  <span>Members</span>
                </div>
                <div className="text-xl font-bold">{project.members.length}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
                  <Wifi className="w-3 h-3" />
                  <span>Demos</span>
                </div>
                <div className="text-xl font-bold">{project.simulations.length}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
                  <Star className="w-3 h-3" />
                  <span>Main Instructor Score</span>
                </div>
                <div className="text-xl font-bold">{project.finalSubmission?.instructorGrade || 0}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Average Score by Another Instructor</span>
                </div>
                <div className="text-xl font-bold">{project.averageGraderGrade?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex gap-1 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Description</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Components</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{project.component}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Project Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Created</div>
                        <div className="font-medium text-gray-900">
                          {formatVietnamTime(project.createdAt, "DD/MM/YYYY HH:mm")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Instructor</div>
                        <div className="font-medium text-gray-900">{project.instructorName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Team Members</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {project.members.map((member) => (
                    <div
                      key={member.userId}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{member.fullName}</h4>
                            {member.roleInGroup === "Leader" && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                Leader
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500 mt-1">{member.roleInGroup}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "simulation" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Live IoT Demonstrations</h3>
                {project.simulations.length > 0 ? (
                  <div className="space-y-4">
                    {project.simulations.map((sim) => (
                      <div key={sim.simulationId} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
                        <div className="bg-blue-600 p-4 text-white">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold">{sim.title}</h4>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                              {sim.status}
                            </span>
                          </div>
                          <p className="text-blue-100 text-sm mb-3">{sim.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatVietnamTime(sim.createdAt, "DD/MM/YYYY")}</span>
                            </div>
                            <a
                              href={sim.wokwiProjectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:underline ml-auto"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Open Simulation</span>
                            </a>
                          </div>
                        </div>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={`https://wokwi.com/projects/${sim.wokwiProjectId}`}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={sim.title}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Wifi className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No simulations available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "submission" && project.finalSubmission && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {project.finalSubmission.finalReportUrl && (
                    <a
                      href={project.finalSubmission.finalReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Final Report</h4>
                          <p className="text-xs text-gray-600">View detailed documentation</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </div>
                    </a>
                  )}

                  {project.finalSubmission.presentationUrl && (
                    <a
                      href={project.finalSubmission.presentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <Presentation className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Presentation</h4>
                          <p className="text-xs text-gray-600">View project slides</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                    </a>
                  )}

                  {project.finalSubmission.sourceCodeUrl && (
                    <a
                      href={project.finalSubmission.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Source Code</h4>
                          <p className="text-xs text-gray-600">Download complete code</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </a>
                  )}

                  {project.finalSubmission.videoDemoUrl && (
                    <a
                      href={project.finalSubmission.videoDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Video Demo</h4>
                          <p className="text-xs text-gray-600">Watch project demo</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </a>
                  )}
                </div>

                {project.finalSubmission.repositoryUrl && (
                  <a
                    href={project.finalSubmission.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 rounded-lg p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Github className="w-5 h-5 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">GitHub Repository</h4>
                        <p className="text-xs text-gray-300">View source on GitHub</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </a>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Final Grade</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-green-600">
                          {project.finalSubmission.instructorGrade}
                        </span>
                        <span className="text-2xl text-gray-400">/100</span>
                      </div>
                      {project.finalSubmission.instructorFeedback && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <h4 className="text-xs font-semibold text-gray-900 mb-1">Instructor Feedback</h4>
                          <p className="text-sm text-gray-700">{project.finalSubmission.instructorFeedback}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Award className="w-3 h-3" />
                        <span>Graded by {project.finalSubmission.gradedByInstructorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {project.graderGrades.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900">Grader Evaluations</h3>
                      {project.averageGraderGrade && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Avg:</span>
                          <span className="text-base font-bold text-blue-600">
                            {project.averageGraderGrade.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {project.graderGrades.map((grade) => (
                        <div key={grade.gradeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{grade.instructorName}</h4>
                              <p className="text-xs text-gray-600">{grade.instructorEmail}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-yellow-500" />
                              <span className="text-xl font-bold text-gray-900">{grade.grade}</span>
                            </div>
                          </div>
                          {grade.feedback && (
                            <div className="bg-white rounded-lg p-3 mt-2">
                              <p className="text-sm text-gray-700">{grade.feedback}</p>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {formatVietnamTime(grade.gradedAt, "DD/MM/YYYY HH:mm")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
