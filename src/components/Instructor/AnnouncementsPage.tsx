import React, { useState } from 'react';
import { Plus, MessageSquare, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { Announcement } from '../../types';
import { mockAnnouncements } from '../../data/mockData';

interface AnnouncementsPageProps {
  onBack: () => void;
}

const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ onBack }) => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'all' as 'all' | 'class' | 'role',
    targetClass: '',
    targetRole: 'student' as 'student' | 'instructor',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const announcement: Announcement = {
      id: editingAnnouncement?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      audience: formData.audience,
      targetClass: formData.audience === 'class' ? formData.targetClass : undefined,
      targetRole: formData.audience === 'role' ? formData.targetRole : undefined,
      createdAt: editingAnnouncement?.createdAt || new Date().toISOString(),
      createdBy: '2', // Current instructor ID
      createdByName: 'Dr. Sarah Johnson',
      priority: formData.priority,
      status: 'active',
    };

    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? announcement : a));
    } else {
      setAnnouncements(prev => [announcement, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      audience: 'all',
      targetClass: '',
      targetRole: 'student',
      priority: 'medium',
    });
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      targetClass: announcement.targetClass || '',
      targetRole: announcement.targetRole || 'student',
      priority: announcement.priority,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getAudienceText = (announcement: Announcement) => {
    switch (announcement.audience) {
      case 'class': return `Class: ${announcement.targetClass}`;
      case 'role': return `Role: ${announcement.targetRole?.charAt(0).toUpperCase()}${announcement.targetRole?.slice(1)}`;
      default: return 'All Users';
    }
  };

  if (showForm) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <button
            onClick={resetForm}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            ← Back to Announcements
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
          </h1>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter announcement content"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience *
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => handleInputChange('audience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="class">Specific Class</option>
                    <option value="role">Specific Role</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {formData.audience === 'class' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Class
                  </label>
                  <input
                    type="text"
                    value={formData.targetClass}
                    onChange={(e) => handleInputChange('targetClass', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter class name"
                  />
                </div>
              )}

              {formData.audience === 'role' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => handleInputChange('targetRole', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingAnnouncement ? 'Update' : 'Send'} Announcement
              </button>
            </div>
          </form>
        </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Manage class and system announcements</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {announcements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">{announcement.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{getAudienceText(announcement)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>by {announcement.createdByName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
            <p className="text-gray-600 mb-4">Create your first announcement to communicate with students.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Announcement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;