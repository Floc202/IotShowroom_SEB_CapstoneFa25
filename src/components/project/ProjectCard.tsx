import { Cpu, Trophy, TrendingUp, ArrowRight, Users, Wifi } from "lucide-react";
import type { SemesterProjectDetail } from "../../types/project";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: SemesterProjectDetail;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const getBadges = () => {
    const badges: Array<{ label: string; type: "demo" | "fame" }> = [];
    if (project.simulations && project.simulations.length > 0) {
      badges.push({ label: "Live Demo", type: "demo" });
    }
    if (
      project.finalSubmission?.instructorGrade &&
      project.finalSubmission.instructorGrade >= 90
    ) {
      badges.push({ label: "Hall of Fame", type: "fame" });
    }
    return badges;
  };

  const getScore = () => {
    if (project.finalSubmission?.instructorGrade) {
      return project.finalSubmission.instructorGrade.toFixed(1);
    }
    if (project.averageGraderGrade) {
      return project.averageGraderGrade.toFixed(1);
    }
    return null;
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const badges = getBadges();
  const score = getScore();

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
      onClick={() => navigate(`/projects/${project.projectId}`)}
    >
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-48 flex flex-col items-center justify-center p-6 relative">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-3">
          <Cpu className="w-12 h-12 text-white" />
        </div>
        {project.simulations.length > 0 && (
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-white text-xs font-semibold">
            <Wifi className="w-3 h-3" />
            <span>{project.simulations.length} Demo{project.simulations.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex gap-2 mb-3 flex-wrap">
          {badges.map((badge, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                badge.type === "demo"
                  ? "bg-emerald-100 text-emerald-700 flex items-center gap-1"
                  : "bg-yellow-100 text-yellow-700 flex items-center gap-1"
              }`}
            >
              {badge.type === "demo" && <Wifi className="w-3 h-3" />}
              {badge.type === "fame" && <Trophy className="w-3 h-3" />}
              {badge.label}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {truncateDescription(project.description, 120)}
        </p>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {project.groupName}
        </p>
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div>{project.className}</div>
          <div>{project.instructorName}</div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {score ? (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-gray-900">{score}</span>
              <span className="text-gray-500 text-sm">/100</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Not graded</div>
          )}
          <div className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            View <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
