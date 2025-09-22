import React from 'react';
import { BookOpen, Users, FileCheck, TrendingUp } from 'lucide-react';

interface InstructorDashboardProps {
  onNavigate: (page: string) => void;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Active Classes',
      value: '3',
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: 'This semester',
    },
    {
      title: 'Total Students',
      value: '85',
      icon: Users,
      color: 'bg-emerald-500',
      trend: 'Across all classes',
    },
    {
      title: 'Projects to Evaluate',
      value: '12',
      icon: FileCheck,
      color: 'bg-orange-500',
      trend: '3 urgent',
    },
    {
      title: 'Average Score',
      value: '78%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: 'Class average',
    },
  ];

  const pendingEvaluations = [
    {
      id: '1',
      title: 'Smart Home IoT System',
      student: 'Alex Chen',
      class: 'IoT Fundamentals',
      submittedDate: '2025-01-18',
      daysWaiting: 2,
    },
    {
      id: '2',
      title: 'Weather Monitoring Station',
      student: 'Sarah Johnson',
      class: 'Sensor Networks',
      submittedDate: '2025-01-17',
      daysWaiting: 3,
    },
    {
      id: '3',
      title: 'Automated Plant Care',
      student: 'Mike Wilson',
      class: 'IoT Applications',
      submittedDate: '2025-01-16',
      daysWaiting: 4,
    },
  ];

  const recentActivity = [
    { type: 'evaluation', message: 'Evaluated "Smart Traffic System" by John Doe', time: '2 hours ago' },
    { type: 'submission', message: 'New project submitted by Emma Davis', time: '4 hours ago' },
    { type: 'announcement', message: 'Posted announcement about final projects', time: '1 day ago' },
    { type: 'evaluation', message: 'Evaluated "IoT Security System" by Alex Chen', time: '2 days ago' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor student progress and manage evaluations</p>
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
        {/* Pending Evaluations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Evaluations</h2>
              <button
                onClick={() => onNavigate('evaluation')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingEvaluations.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.student} • {project.class}</p>
                    <p className="text-xs text-gray-500">Submitted {project.submittedDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {project.daysWaiting} days waiting
                    </span>
                    <div className="mt-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Evaluate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'evaluation' ? 'bg-blue-100' :
                    activity.type === 'submission' ? 'bg-emerald-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'evaluation' && <FileCheck className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'submission' && <FileCheck className="w-4 h-4 text-emerald-600" />}
                    {activity.type === 'announcement' && <FileCheck className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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

export default InstructorDashboard;