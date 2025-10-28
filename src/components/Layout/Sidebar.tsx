import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  FolderOpen,
  Bell,
  User,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
  Home,
  Target,
  FileCheck,
  ClipboardCheck,
  Trophy,
  Monitor,
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'classes', icon: BookOpen, label: 'My Classes' },
          { id: 'projects', icon: FolderOpen, label: 'My Projects' },
          { id: 'notifications', icon: Bell, label: 'Notifications' },
          { id: 'profile', icon: User, label: 'Profile' },
        ];
      case 'instructor':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'classes', icon: BookOpen, label: 'Classes' },
          { id: 'groups', icon: Users, label: 'Groups' },
          { id: 'proposals', icon: ClipboardCheck, label: 'Proposals' },
          { id: 'milestones', icon: Target, label: 'Milestones' },
          { id: 'grading', icon: FileCheck, label: 'Grading' },
          { id: 'announcements', icon: MessageSquare, label: 'Announcements' },
          { id: 'profile', icon: User, label: 'Profile' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'users', icon: Users, label: 'User Management' },
          { id: 'admin-classes', icon: BookOpen, label: 'Classes' },
          { id: 'monitoring', icon: Monitor, label: 'Project Monitoring' },
          { id: 'halloffame', icon: Trophy, label: 'Hall of Fame' },
          { id: 'announcements', icon: MessageSquare, label: 'Announcements' },
          { id: 'reports', icon: BarChart3, label: 'Reports' },
          { id: 'settings', icon: Settings, label: 'System Settings' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">IoT Projects</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeItem === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;