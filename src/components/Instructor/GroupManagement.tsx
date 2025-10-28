import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, UserPlus, UserMinus, Search } from 'lucide-react';
import { mockGroups, mockClasses, mockUsers } from '../../data/mockData';

interface GroupManagementProps {
  classId?: string;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ classId }) => {
  const [selectedClass, setSelectedClass] = useState(classId || '1');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const currentClass = mockClasses.find(c => c.id === selectedClass);
  const groups = mockGroups.filter(g => g.classId === selectedClass);
  const instructorClasses = mockClasses.filter(c => c.instructorId === '2');

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Bạn có chắc muốn xóa nhóm này?')) {
      console.log('Deleting group:', groupId);
      // Logic xóa nhóm
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý nhóm</h1>
        <p className="text-gray-600 mt-2">Quản lý các nhóm sinh viên trong lớp học</p>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn lớp học
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {instructorClasses.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - {cls.semester} {cls.year}
            </option>
          ))}
        </select>

        {currentClass && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Số nhóm hiện tại</p>
              <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Số nhóm tối đa</p>
              <p className="text-2xl font-bold text-emerald-600">{currentClass.maxGroups}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">SV/Nhóm (max)</p>
              <p className="text-2xl font-bold text-purple-600">{currentClass.maxMembersPerGroup}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Tổng sinh viên</p>
              <p className="text-2xl font-bold text-orange-600">{currentClass.studentCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm hoặc nhóm trưởng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCreateGroup}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo nhóm mới
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      <Users className="w-4 h-4" />
                      {group.members.length}/{group.maxMembers} thành viên
                    </span>
                    {group.topicProposal && (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        group.topicProposal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        group.topicProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        group.topicProposal.status === 'revision_required' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.topicProposal.status === 'approved' ? 'Đã duyệt' :
                         group.topicProposal.status === 'pending' ? 'Chờ duyệt' :
                         group.topicProposal.status === 'revision_required' ? 'Cần sửa' : 'Từ chối'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa nhóm"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa nhóm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Thành viên nhóm</h4>
              <div className="space-y-2">
                {group.members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.studentName}
                          {member.role === 'leader' && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              Nhóm trưởng
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    {member.role !== 'leader' && (
                      <button
                        onClick={() => console.log('Remove member:', member.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Gỡ khỏi nhóm"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {group.members.length < group.maxMembers && (
                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Thêm thành viên
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm nào'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Thử tìm kiếm với từ khóa khác' 
              : 'Hãy tạo nhóm đầu tiên cho lớp này'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo nhóm mới
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Group Modal would go here */}
    </div>
  );
};

export default GroupManagement;
