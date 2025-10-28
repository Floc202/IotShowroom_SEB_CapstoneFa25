import React from 'react';
import { BookOpen, Users, FileCheck, TrendingUp, Target, Clock, CheckCircle } from 'lucide-react';
import { mockClasses, mockGroups, mockMilestones } from '../../data/mockData';

interface InstructorDashboardProps {
  onNavigate: (page: string) => void;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onNavigate }) => {
  // Instructor ID = '2' (TS. Trần Thị Hương)
  const instructorClasses = mockClasses.filter(c => c.instructorId === '2');
  const totalStudents = instructorClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
  const totalGroups = instructorClasses.reduce((sum, cls) => sum + cls.groupCount, 0);
  
  const allGroups = mockGroups.filter(g => 
    instructorClasses.some(c => c.id === g.classId)
  );
  
  const pendingProposals = allGroups.filter(g => 
    g.topicProposal?.status === 'pending'
  );

  const allMilestones = mockMilestones.filter(m => 
    instructorClasses.some(c => c.id === m.classId)
  );
  
  const pendingGrading = allMilestones.reduce((sum, m) => {
    const ungraded = m.submissions.filter(s => s.status === 'submitted').length;
    return sum + ungraded;
  }, 0);

  const stats = [
    {
      title: 'Lớp học đang dạy',
      value: instructorClasses.length.toString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      trend: 'Học kỳ này',
    },
    {
      title: 'Tổng sinh viên',
      value: totalStudents.toString(),
      icon: Users,
      color: 'bg-emerald-500',
      trend: `${totalGroups} nhóm`,
    },
    {
      title: 'Chờ chấm điểm',
      value: pendingGrading.toString(),
      icon: FileCheck,
      color: 'bg-orange-500',
      trend: pendingProposals.length > 0 ? `${pendingProposals.length} đề xuất chờ duyệt` : 'Tất cả đã duyệt',
    },
    {
      title: 'Điểm trung bình',
      value: '82%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: 'Cả lớp',
    },
  ];

  const recentActivity = [
    { type: 'submission', message: 'Nhóm Smart Home nộp Milestone 1', class: 'Cơ sở IoT', time: '2 giờ trước', urgent: false },
    { type: 'proposal', message: 'Đề xuất "Trạm quan trắc thời tiết" chờ duyệt', class: 'Cơ sở IoT', time: '4 giờ trước', urgent: true },
    { type: 'graded', message: 'Đã chấm Milestone 1 - Nhóm Smart Home', class: 'Cơ sở IoT', time: '1 ngày trước', urgent: false },
    { type: 'announcement', message: 'Đăng thông báo về deadline Final Project', class: 'Tất cả', time: '2 ngày trước', urgent: false },
  ];

  const upcomingDeadlines = [
    { milestone: 'Milestone 2: Prototype', class: 'Cơ sở IoT', deadline: '2025-03-15', daysLeft: 45 },
    { milestone: 'Milestone 3: Testing', class: 'Cơ sở IoT', deadline: '2025-04-15', daysLeft: 76 },
    { milestone: 'Final Project', class: 'Cơ sở IoT', deadline: '2025-05-15', daysLeft: 106 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Giảng viên</h1>
        <p className="text-gray-600 mt-2">Chào mừng trở lại, TS. Trần Thị Hương 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Lớp học của tôi</h2>
              <button
                onClick={() => onNavigate('classes')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xem tất cả
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {instructorClasses.map((cls) => (
                <div 
                  key={cls.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('classes')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{cls.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cls.studentCount} SV
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {cls.groupCount} nhóm
                    </span>
                    <span className="text-xs text-gray-500">
                      {cls.semester} {cls.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cần xử lý</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {pendingProposals.length > 0 && (
                <button
                  onClick={() => onNavigate('proposals')}
                  className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{pendingProposals.length} đề xuất chờ duyệt</p>
                        <p className="text-sm text-gray-600">Nhấn để xem chi tiết</p>
                      </div>
                    </div>
                    <span className="text-yellow-600">→</span>
                  </div>
                </button>
              )}

              {pendingGrading > 0 && (
                <button
                  onClick={() => onNavigate('grading')}
                  className="w-full p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{pendingGrading} bài chờ chấm điểm</p>
                        <p className="text-sm text-gray-600">Nhấn để chấm điểm</p>
                      </div>
                    </div>
                    <span className="text-orange-600">→</span>
                  </div>
                </button>
              )}

              {pendingProposals.length === 0 && pendingGrading === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-gray-600">Tất cả công việc đã hoàn thành! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'submission' ? 'bg-blue-100' :
                    activity.type === 'proposal' ? 'bg-yellow-100' :
                    activity.type === 'graded' ? 'bg-emerald-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'submission' && <FileCheck className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'proposal' && <Clock className="w-4 h-4 text-yellow-600" />}
                    {activity.type === 'graded' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    {activity.type === 'announcement' && <Target className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.class} • {activity.time}
                    </p>
                  </div>
                  {activity.urgent && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Deadline sắp tới</h2>
              <button
                onClick={() => onNavigate('milestones')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Quản lý
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingDeadlines.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.milestone}</h4>
                      <p className="text-sm text-gray-600">{item.class}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.daysLeft < 30 ? 'bg-red-100 text-red-800' :
                      item.daysLeft < 60 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.daysLeft} ngày
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(item.deadline).toLocaleDateString('vi-VN')}
                  </p>
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