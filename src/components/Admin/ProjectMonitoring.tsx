import React, { useState } from 'react';
import { Search, FolderOpen, Users, CheckCircle, Clock, AlertCircle, TrendingUp, Eye } from 'lucide-react';

interface Project {
  id: string;
  groupName: string;
  className: string;
  semester: string;
  topic: string;
  status: 'planning' | 'in-progress' | 'completed' | 'pending-review';
  progress: number;
  members: string[];
  instructor: string;
  milestones: {
    name: string;
    status: 'completed' | 'in-progress' | 'pending';
    score?: number;
    weight: number;
  }[];
  totalScore: number;
}

const ProjectMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const mockProjects: Project[] = [
    {
      id: '1',
      groupName: 'IoT Smart Home',
      className: 'SE1718_IoT_FA25',
      semester: 'Fall 2025',
      topic: 'Smart Home Automation System with Voice Control',
      status: 'in-progress',
      progress: 65,
      members: ['Nguyen Van A', 'Tran Thi B', 'Le Van C'],
      instructor: 'Dr. Nguyen Van Minh',
      milestones: [
        { name: 'Topic Proposal', status: 'completed', score: 9, weight: 10 },
        { name: 'System Design', status: 'completed', score: 8.5, weight: 20 },
        { name: 'Implementation', status: 'in-progress', weight: 30 },
        { name: 'Final Project', status: 'pending', weight: 40 },
      ],
      totalScore: 8.75,
    },
    {
      id: '2',
      groupName: 'Healthcare Monitor',
      className: 'SE1718_IoT_FA25',
      semester: 'Fall 2025',
      topic: 'Patient Health Monitoring System using IoT',
      status: 'in-progress',
      progress: 45,
      members: ['Pham Van D', 'Hoang Thi E'],
      instructor: 'Dr. Nguyen Van Minh',
      milestones: [
        { name: 'Topic Proposal', status: 'completed', score: 8, weight: 10 },
        { name: 'System Design', status: 'in-progress', weight: 20 },
        { name: 'Implementation', status: 'pending', weight: 30 },
        { name: 'Final Project', status: 'pending', weight: 40 },
      ],
      totalScore: 8.0,
    },
    {
      id: '3',
      groupName: 'Smart Parking',
      className: 'SE1620_IoT_SP25',
      semester: 'Spring 2025',
      topic: 'Intelligent Parking Management System',
      status: 'completed',
      progress: 100,
      members: ['Vu Van F', 'Nguyen Thi G', 'Tran Van H'],
      instructor: 'Dr. Tran Van Hung',
      milestones: [
        { name: 'Topic Proposal', status: 'completed', score: 9.5, weight: 10 },
        { name: 'System Design', status: 'completed', score: 9, weight: 20 },
        { name: 'Implementation', status: 'completed', score: 8.5, weight: 30 },
        { name: 'Final Project', status: 'completed', score: 9.5, weight: 40 },
      ],
      totalScore: 9.15,
    },
  ];

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = 
      project.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = semesterFilter === 'all' || project.semester === semesterFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesSemester && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending-review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Monitoring</h1>
        <p className="text-gray-600 mt-2">Monitor all projects across all classes (Read-only)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{mockProjects.length}</div>
          <div className="text-blue-100 text-sm mt-1">Total Projects</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'completed').length}</div>
          <div className="text-green-100 text-sm mt-1">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'in-progress').length}</div>
          <div className="text-yellow-100 text-sm mt-1">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">
            {(mockProjects.reduce((sum, p) => sum + p.totalScore, 0) / mockProjects.length).toFixed(2)}
          </div>
          <div className="text-purple-100 text-sm mt-1">Average Score</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Semesters</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Spring 2025">Spring 2025</option>
            <option value="Summer 2025">Summer 2025</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending-review">Pending Review</option>
            <option value="planning">Planning</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{project.groupName}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{project.topic}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-4 h-4" />
                    {project.className}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.members.length} members
                  </span>
                  <span>Instructor: {project.instructor}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(project)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {project.progress}%</span>
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <TrendingUp className="w-4 h-4" />
                  Score: {project.totalScore}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {project.milestones.map((milestone, index) => (
                <div key={index} className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-xs font-medium mb-1 ${getMilestoneStatusColor(milestone.status)}`}>
                    {milestone.name}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {milestone.score ? `${milestone.score}/10` : '-'}
                  </div>
                  <div className="text-xs text-gray-500">{milestone.weight}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No projects found matching your criteria.</p>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.groupName}</h2>
                  <p className="text-gray-600">{selectedProject.topic}</p>
                </div>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Class</h3>
                  <p className="text-gray-900">{selectedProject.className}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Semester</h3>
                  <p className="text-gray-900">{selectedProject.semester}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Instructor</h3>
                  <p className="text-gray-900">{selectedProject.instructor}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                    {getStatusIcon(selectedProject.status)}
                    {selectedProject.status}
                  </span>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Team Members
                </h3>
                <div className="space-y-2">
                  {selectedProject.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {member.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member}</div>
                        <div className="text-xs text-gray-500">{index === 0 ? 'Team Leader' : 'Member'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones & Scores */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Milestones & Scores
                </h3>
                <div className="space-y-3">
                  {selectedProject.milestones.map((milestone, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{milestone.name}</div>
                          <div className="text-sm text-gray-500">Weight: {milestone.weight}%</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                          {milestone.status}
                        </span>
                      </div>
                      {milestone.score && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Score</div>
                          <div className="text-2xl font-bold text-emerald-600">{milestone.score}/10</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Overall Project Score</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-2">{selectedProject.totalScore}/10</div>
                <div className="text-sm text-gray-600">
                  Based on weighted average of completed milestones
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ This is a read-only view. Only the assigned instructor can grade and modify project details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMonitoring;
