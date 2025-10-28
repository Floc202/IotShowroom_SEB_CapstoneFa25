import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, Percent } from 'lucide-react';
import { mockMilestones, mockClasses } from '../../data/mockData';

const MilestoneManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

  const instructorClasses = mockClasses.filter(c => c.instructorId === '2');
  const milestones = mockMilestones.filter(m => m.classId === selectedClass).sort((a, b) => a.order - b.order);

  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
  const isWeightValid = totalWeight === 100;

  const handleCreateMilestone = () => {
    setShowCreateModal(true);
  };

  const handleEditMilestone = (milestone: any) => {
    setSelectedMilestone(milestone);
    setShowEditModal(true);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (confirm('Bạn có chắc muốn xóa milestone này?')) {
      console.log('Deleting milestone:', milestoneId);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Milestone</h1>
        <p className="text-gray-600 mt-2">Định nghĩa và quản lý các mốc đánh giá trong học kỳ</p>
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

        {/* Weight Summary */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Tổng trọng số:</span>
            <span className={`text-2xl font-bold ${isWeightValid ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalWeight}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                totalWeight === 100 ? 'bg-emerald-500' : 
                totalWeight < 100 ? 'bg-orange-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {isWeightValid ? '✓ Tổng trọng số hợp lệ' : 
             totalWeight < 100 ? `⚠ Thiếu ${100 - totalWeight}% để đạt 100%` :
             `⚠ Vượt quá ${totalWeight - 100}%`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            * Final Project phải chiếm 40% tổng điểm
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
              <p className="text-sm text-gray-600">Milestones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWeight}%</p>
              <p className="text-sm text-gray-600">Tổng trọng số</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.filter(m => new Date(m.deadline) > new Date()).length}
              </p>
              <p className="text-sm text-gray-600">Sắp tới</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.find(m => m.isFinalProject)?.weight || 0}%
              </p>
              <p className="text-sm text-gray-600">Final Project</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateMilestone}
          disabled={!isWeightValid && milestones.length > 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Thêm Milestone mới
        </button>
        {!isWeightValid && milestones.length > 0 && (
          <p className="text-sm text-red-600 mt-2">
            Vui lòng điều chỉnh trọng số các milestone hiện tại trước khi thêm mới
          </p>
        )}
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const isPast = new Date(milestone.deadline) < new Date();
          const submissionCount = milestone.submissions.length;
          const gradedCount = milestone.submissions.filter(s => s.status === 'graded').length;

          return (
            <div 
              key={milestone.id} 
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
                milestone.isFinalProject ? 'border-yellow-400' : 'border-gray-200'
              }`}
            >
              <div className={`p-6 ${
                milestone.isFinalProject 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50' 
                  : isPast 
                  ? 'bg-gray-50' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{milestone.name}</h3>
                        {milestone.isFinalProject && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            🏆 Final Project
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 ml-13">{milestone.description}</p>

                    <div className="flex flex-wrap gap-4 ml-13">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className={`font-medium ${isPast ? 'text-red-600' : 'text-gray-700'}`}>
                          Deadline: {new Date(milestone.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Percent className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          Trọng số: {milestone.weight}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {submissionCount} bài nộp • {gradedCount} đã chấm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMilestone(milestone)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      disabled={milestone.isFinalProject}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                      title={milestone.isFinalProject ? 'Không thể xóa Final Project' : 'Xóa'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {submissionCount > 0 && (
                  <div className="mt-4 ml-13">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ chấm điểm</span>
                      <span className="font-medium text-gray-900">
                        {gradedCount}/{submissionCount} ({Math.round((gradedCount / submissionCount) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(gradedCount / submissionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {milestones.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có milestone nào</h3>
          <p className="text-gray-600 mb-6">
            Hãy tạo milestone đầu tiên cho lớp học này. <br />
            Lưu ý: Tổng trọng số phải bằng 100% và Final Project phải chiếm 40%.
          </p>
          <button
            onClick={handleCreateMilestone}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo Milestone đầu tiên
          </button>
        </div>
      )}

      {/* Validation Rules */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Quy tắc Milestone:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ Tối thiểu 3 milestones (không bao gồm Final Project)</li>
          <li>✓ Trọng số phải là số nguyên (không có số lẻ)</li>
          <li>✓ Tổng trọng số các milestone = 100%</li>
          <li>✓ Final Project luôn chiếm 40% tổng điểm</li>
          <li>✓ Deadline phải theo thứ tự thời gian</li>
          <li>✓ Sau khi công bố điểm, không được chỉnh sửa</li>
        </ul>
      </div>

      {/* Modals would go here */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {showCreateModal ? 'Tạo Milestone mới' : 'Chỉnh sửa Milestone'}
            </h2>
            <p className="text-gray-600 mb-4">Form tạo/sửa milestone sẽ được implement ở đây...</p>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedMilestone(null);
              }}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneManagement;
