import React, { useState } from 'react';
import { FolderOpen, User, Calendar, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Project } from '../../types';
import { mockProjects, mockClasses } from '../../data/mockData';

interface ProjectListInstructorProps {
  classId?: string;
  onViewProject: (project: Project) => void;
  onBack: () => void;
}

const ProjectListInstructor: React.FC<ProjectListInstructorProps> = ({ 
  classId, 
  onViewProject, 
  onBack 
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter projects by class if classId is provided
  let projects = classId 
    ? mockProjects.filter(p => p.classId === classId)
    : mockProjects;

  // Apply status filter
  if (statusFilter !== 'all') {
    projects = projects.filter(p => p.status === statusFilter);
  }

  const selectedClass = classId ? mockClasses.find(c => c.id === classId) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'evaluated': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'submitted': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated': return 'bg-emerald-100 text-emerald-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusCounts = {
    all: projects.length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    evaluated: projects.filter(p => p.status === 'evaluated').length,
    draft: projects.filter(p => p.status === 'draft').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to {classId ? 'Classes' : 'Dashboard'}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedClass ? `${selectedClass.name} - Projects` : 'All Projects'}
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedClass 
                ? `Manage projects for ${selectedClass.semester} ${selectedClass.year}`
                : 'Evaluate and provide feedback on student projects'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Projects', count: statusCounts.all },
              { id: 'submitted', label: 'Pending Evaluation', count: statusCounts.submitted },
              { id: 'evaluated', label: 'Evaluated', count: statusCounts.evaluated },
              { id: 'draft', label: 'Drafts', count: statusCounts.draft },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Demo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-500">{project.className}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{project.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        project.demoConfig.demoUrl 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.demoConfig.demoUrl ? 'Available' : 'No Demo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {project.submittedAt 
                            ? new Date(project.submittedAt).toLocaleDateString()
                            : 'Not submitted'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.evaluation ? (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {project.evaluation.totalScore}/{project.evaluation.maxScore}
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({Math.round((project.evaluation.totalScore / project.evaluation.maxScore) * 100)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewProject(project)}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {project.status === 'submitted' ? 'Evaluate' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {statusFilter !== 'all' ? statusFilter : ''} projects found
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? "There are no projects in this class yet."
                : `There are no ${statusFilter} projects to display.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListInstructor;