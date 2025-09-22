import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, FolderOpen, TrendingUp, FileText, Award } from 'lucide-react';

interface ReportsPageProps {
  onBack: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onBack }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    year: '2025',
    semester: 'Spring',
    classId: 'all',
  });

  const reportTypes = [
    {
      id: 'semester',
      title: 'Semester Overview',
      description: 'Complete overview of projects and performance for the semester',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      id: 'class',
      title: 'Class Performance',
      description: 'Detailed analysis of individual class performance and statistics',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      id: 'project',
      title: 'Project Analytics',
      description: 'Project submission trends, evaluation scores, and completion rates',
      icon: FolderOpen,
      color: 'bg-purple-500',
    },
    {
      id: 'leaderboard',
      title: 'Student Leaderboard',
      description: 'Top performing students based on project scores and participation',
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  const mockData = {
    semester: {
      totalProjects: 156,
      completedProjects: 142,
      averageScore: 78.5,
      topClass: 'IoT Fundamentals',
      projectsByMonth: [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 62 },
        { month: 'Mar', count: 49 },
      ],
      scoreDistribution: [
        { range: '90-100', count: 28 },
        { range: '80-89', count: 45 },
        { range: '70-79', count: 38 },
        { range: '60-69', count: 21 },
        { range: '<60', count: 10 },
      ],
    },
    leaderboard: [
      { rank: 1, name: 'Alex Chen', score: 94.5, projects: 3, class: 'IoT Fundamentals' },
      { rank: 2, name: 'Sarah Johnson', score: 92.8, projects: 2, class: 'Sensor Networks' },
      { rank: 3, name: 'Mike Wilson', score: 91.2, projects: 3, class: 'IoT Applications' },
      { rank: 4, name: 'Emma Davis', score: 89.7, projects: 2, class: 'Advanced IoT' },
      { rank: 5, name: 'John Smith', score: 88.9, projects: 3, class: 'IoT Fundamentals' },
    ],
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const exportReport = (format: 'pdf' | 'word') => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  if (selectedReport) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={() => setSelectedReport(null)}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            ← Back to Reports
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.title} Report
              </h1>
              <p className="text-gray-600 mt-1">
                {filters.semester} {filters.year} - Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => exportReport('word')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export Word
              </button>
            </div>
          </div>
        </div>

        {selectedReport === 'semester' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FolderOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mockData.semester.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mockData.semester.completedProjects}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mockData.semester.averageScore}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{mockData.semester.topClass}</p>
                    <p className="text-sm text-gray-600">Top Class</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Month</h3>
                <div className="space-y-4">
                  {mockData.semester.projectsByMonth.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / 70) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                <div className="space-y-4">
                  {mockData.semester.scoreDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.range}%</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / 45) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-900 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Average Score</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Projects</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockData.leaderboard.map((student) => (
                    <tr key={student.rank} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            student.rank === 1 ? 'bg-yellow-500' :
                            student.rank === 2 ? 'bg-gray-400' :
                            student.rank === 3 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {student.rank}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.score}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{student.projects}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{student.class}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports and analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={filters.classId}
              onChange={(e) => handleFilterChange('classId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              <option value="1">IoT Fundamentals</option>
              <option value="2">Sensor Networks</option>
              <option value="3">IoT Applications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  <button
                    onClick={() => generateReport(report.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsPage;