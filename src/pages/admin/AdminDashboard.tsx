import {
  Users,
  FolderOpen,
  BookOpen,
  BarChart3,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const AdminDashboard = ({}) => {
  const overviewStats = [
    {
      title: "Total Users",
      value: "1,247",
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Projects",
      value: "456",
      icon: FolderOpen,
      color: "bg-emerald-500",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Active Classes",
      value: "23",
      icon: BookOpen,
      color: "bg-purple-500",
      change: "+2",
      trend: "up",
    },
    {
      title: "Reports Generated",
      value: "89",
      icon: BarChart3,
      color: "bg-orange-500",
      change: "+15%",
      trend: "up",
    },
  ];

  const userStats = [
    { role: "Students", count: 1089, percentage: 87.3 },
    { role: "Instructors", count: 156, percentage: 12.5 },
    { role: "Admins", count: 2, percentage: 0.2 },
  ];

  const recentUsers = [
    {
      name: "John Smith",
      email: "john.smith@university.edu",
      role: "Student",
      joinDate: "2025-01-18",
    },
    {
      name: "Dr. Emily Johnson",
      email: "emily.j@university.edu",
      role: "Instructor",
      joinDate: "2025-01-17",
    },
    {
      name: "Alex Chen",
      email: "alex.chen@university.edu",
      role: "Student",
      joinDate: "2025-01-16",
    },
    {
      name: "Sarah Wilson",
      email: "sarah.w@university.edu",
      role: "Student",
      joinDate: "2025-01-15",
    },
  ];

  const systemAlerts = [
    {
      type: "info",
      message: "System maintenance scheduled for this weekend",
      time: "2 hours ago",
    },
    {
      type: "warning",
      message: "High storage usage detected (85% full)",
      time: "5 hours ago",
    },
    {
      type: "success",
      message: "Database backup completed successfully",
      time: "1 day ago",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          System overview and management tools
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              User Distribution
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {userStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {stat.role}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {stat.count.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{stat.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Users
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "Instructor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              System Alerts
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "success"
                        ? "bg-emerald-500"
                        : alert.type === "warning"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">
                Add, edit, or remove users
              </p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FolderOpen className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-medium text-gray-900">Announcements</h3>
              <p className="text-sm text-gray-600">Send system announcements</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Generate system reports</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Configure system settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
