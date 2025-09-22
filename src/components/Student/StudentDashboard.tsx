import React from 'react';
import { BookOpen, FolderOpen, Bell, TrendingUp } from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Active Classes',
      value: '4',
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: '+2 this semester',
    },
    {
      title: 'Projects',
      value: '7',
      icon: FolderOpen,
      color: 'bg-emerald-500',
      trend: '3 submitted',
    },
    {
      title: 'Notifications',
      value: '3',
      icon: Bell,
      color: 'bg-orange-500',
      trend: '1 unread',
    },
    {
      title: 'Average Score',
      value: '87%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+5% from last term',
    },
  ];

  const recentProjects = [
    {
      id: '1',
      title: 'Smart Home IoT System',
      class: 'IoT Fundamentals',
      status: 'Submitted',
      score: '92%',
      dueDate: '2025-01-20',
    },
    {
      id: '2',
      title: 'Weather Monitoring Station',
      class: 'Sensor Networks',
      status: 'In Progress',
      score: 'Pending',
      dueDate: '2025-02-15',
    },
    {
      id: '3',
      title: 'Automated Plant Care',
      class: 'IoT Applications',
      status: 'Draft',
      score: 'Not Graded',
      dueDate: '2025-02-28',
    },
  ];

  const upcomingDeadlines = [
    { project: 'Weather Monitoring Station', class: 'Sensor Networks', dueDate: '2025-02-15' },
    { project: 'Automated Plant Care', class: 'IoT Applications', dueDate: '2025-02-28' },
    { project: 'Smart Traffic System', class: 'Advanced IoT', dueDate: '2025-03-10' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your project overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <button
                onClick={() => onNavigate('projects')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.class}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Submitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : project.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{project.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{deadline.project}</h3>
                    <p className="text-sm text-gray-600">{deadline.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{deadline.dueDate}</p>
                    <p className="text-xs text-orange-600">5 days left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;