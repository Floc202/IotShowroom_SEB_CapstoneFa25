import { Tag, Tabs } from "antd";
import {
  Users,
  Calendar,
  CheckCircle,
  UserCircle,
  Hash,
  Crown,
  Award,
  ExternalLink,
  FileText,
  Presentation,
  Code,
  Video,
  Github,
  Clock,
  Cpu,
  Info,
} from "lucide-react";
import { formatVietnamTime } from "../../utils/helpers";
import type { ProjectDetail, GroupMemberInfo } from "../../types/project";

interface GroupProjectInfoProps {
  project: ProjectDetail;
}

export default function GroupProjectInfo({ project }: GroupProjectInfoProps) {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return "bg-green-50 text-green-700 border-green-200";
    if (s === "pending") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "revision")
      return "bg-orange-50 text-orange-700 border-orange-200";
    if (s === "rejected") return "bg-red-50 text-red-700 border-red-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") return <CheckCircle className="w-4 h-4" />;
    if (s === "pending") return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const isGroupMemberInfo = (member: any): member is GroupMemberInfo => {
    return typeof member === "object" && "userId" in member;
  };

  const membersList = Array.isArray(project.members) ? project.members : [];

  const tabItems = [
    {
      key: "overview",
      label: (
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Overview
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Description & Component */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Description</span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                {project.description || "No description provided"}
              </p>
            </div>

            {project.component && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                  <Cpu className="w-5 h-5 text-purple-500" />
                  <span>Components</span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                  {project.component}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatVietnamTime(project.createdAt, "DD/MM/YYYY HH:mm")}</span>
            </div>
            {project.updatedAt && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatVietnamTime(project.updatedAt, "DD/MM/YYYY HH:mm")}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "members",
      label: (
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Team Members ({membersList.length})
        </span>
      ),
      children: membersList.length > 0 && (
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {membersList.map((member, index) => {
              if (isGroupMemberInfo(member)) {
                return (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {member.fullName}
                        </span>
                        {member.roleInGroup === "Leader" && (
                          <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {member.email}
                      </div>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 bg-blue-100 text-blue-700">
                        {member.roleInGroup}
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {typeof member === "string"
                        ? member.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <span className="text-sm text-gray-700">{member}</span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ),
    },
    ...(project.simulations && project.simulations.length > 0
      ? [
          {
            key: "simulations",
            label: (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Simulations ({project.simulations.length})
              </span>
            ),
            children: (
              <div className="space-y-4">
                {project.simulations.map((sim) => (
                  <div key={sim.simulationId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-purple-50 border-b border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{sim.title}</h4>
                        <Tag color={sim.status === "submitted" ? "green" : "orange"}>
                          {sim.status}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{sim.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <a
                          href={sim.wokwiProjectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Simulation
                        </a>
                        <span>{formatVietnamTime(sim.createdAt, "DD/MM/YYYY HH:mm")}</span>
                      </div>
                    </div>
                    <div className="w-full">
                      <iframe
                        src={`https://wokwi.com/projects/${sim.wokwiProjectId}`}
                        className="w-full h-[600px] border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={sim.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(project.finalSubmission
      ? [
          {
            key: "final-submission",
            label: (
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Final Submission
              </span>
            ),
            children: (
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    {project.finalSubmission.finalReportUrl && (
                      <a
                        href={project.finalSubmission.finalReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Final Report
                        </span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                      </a>
                    )}
                    {project.finalSubmission.presentationUrl && (
                      <a
                        href={project.finalSubmission.presentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <Presentation className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Presentation
                        </span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                      </a>
                    )}
                    {project.finalSubmission.sourceCodeUrl && (
                      <a
                        href={project.finalSubmission.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <Code className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Source Code
                        </span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    {project.finalSubmission.videoDemoUrl && (
                      <a
                        href={project.finalSubmission.videoDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <Video className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Video Demo
                        </span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                      </a>
                    )}
                    {project.finalSubmission.repositoryUrl && (
                      <a
                        href={project.finalSubmission.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <Github className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">
                          Repository
                        </span>
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>

                {project.finalSubmission.submissionNotes && (
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <p className="text-sm text-gray-700">
                      {project.finalSubmission.submissionNotes}
                    </p>
                  </div>
                )}

                {/* {project.finalSubmission.instructorGrade !== null && (
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold text-2xl text-green-600">
                            {project.finalSubmission.instructorGrade}
                          </span>
                          <span className="text-gray-500">/100</span>
                        </div>
                        {project.finalSubmission.instructorFeedback && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-700">
                              {project.finalSubmission.instructorFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{project.finalSubmission.gradedByInstructorName}</div>
                        <div>
                          {project.finalSubmission.instructorGradedAt &&
                            formatVietnamTime(
                              project.finalSubmission.instructorGradedAt,
                              "DD/MM/YYYY HH:mm"
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            ),
          },
        ]
      : []),
    // ...(project.graderGrades && project.graderGrades.length > 0
    //   ? [
    //       {
    //         key: "grader-grades",
    //         label: (
    //           <span className="flex items-center gap-2">
    //             <Award className="w-4 h-4" />
    //             Grader Evaluations ({project.graderGrades.length})
    //           </span>
    //         ),
    //         children: (
    //           <div className="bg-white rounded-lg p-5 border border-gray-200">
    //             {project.averageGraderGrade !== null &&
    //               project.averageGraderGrade !== undefined && (
    //                 <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg mb-4 w-fit">
    //                   <span className="text-sm text-gray-600">Average:</span>
    //                   <span className="text-lg font-bold text-blue-600">
    //                     {project.averageGraderGrade.toFixed(1)}
    //                   </span>
    //                 </div>
    //               )}
    //             <div className="space-y-3">
    //               {project.graderGrades.map((grade) => (
    //                 <div
    //                   key={grade.gradeId}
    //                   className="p-4 bg-gray-50 rounded-lg border border-gray-200"
    //                 >
    //                   <div className="flex items-start justify-between mb-2">
    //                     <div>
    //                       <div className="font-semibold text-gray-800">
    //                         {grade.instructorName}
    //                       </div>
    //                       <div className="text-xs text-gray-500">
    //                         {grade.instructorEmail}
    //                       </div>
    //                     </div>
    //                     <div className="flex items-center gap-2">
    //                       <Star className="w-5 h-5 text-yellow-500" />
    //                       <span className="text-xl font-bold text-blue-600">
    //                         {grade.grade}
    //                       </span>
    //                     </div>
    //                   </div>
    //                   {grade.feedback && (
    //                     <div className="flex items-start gap-2 mt-2 text-sm text-gray-700">
    //                       <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    //                       <p>{grade.feedback}</p>
    //                     </div>
    //                   )}
    //                   <div className="text-xs text-gray-500 mt-2">
    //                     {formatVietnamTime(grade.gradedAt, "DD/MM/YYYY HH:mm")}
    //                   </div>
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         ),
    //       },
    //     ]
    //   : []),
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Hash className="w-4 h-4" />
              <span className="font-mono">ID: {project.projectId}</span>
              {project.className && (
                <>
                  <span className="mx-2">•</span>
                  <span>{project.className}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getStatusColor(project.status)}`}
              >
                {getStatusIcon(project.status)}
                <span className="font-semibold text-sm uppercase">
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <UserCircle className="w-4 h-4" />
                <span className="text-sm">
                  Leader: <strong>{project.leaderName}</strong>
                </span>
              </div>
              {project.instructorName && (
                <div className="flex items-center gap-1 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">
                    Instructor: <strong>{project.instructorName}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-gray-500 text-xs mb-1">Members</div>
            <div className="text-2xl font-bold text-blue-600">
              {membersList.length}
            </div>
          </div>
          {project.simulations && project.simulations.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-gray-500 text-xs mb-1">Simulations</div>
              <div className="text-2xl font-bold text-purple-600">
                {project.simulations.length}
              </div>
            </div>
          )}
          {project.averageGraderGrade !== null &&
            project.averageGraderGrade !== undefined && (
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">
                  Avg Grade By Additional Instructor
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {project.averageGraderGrade.toFixed(1)}
                </div>
              </div>
            )}
          {project.finalSubmission?.instructorGrade && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-gray-500 text-xs mb-1">
                Main Instructor Grade
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {project.finalSubmission.instructorGrade}
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
}
