import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle, Clock, Search } from 'lucide-react';
import { mockGroups, mockClasses } from '../../data/mockData';

const TopicProposalReview: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('1');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [feedback, setFeedback] = useState('');

  const instructorClasses = mockClasses.filter(c => c.instructorId === '2');
  const groups = mockGroups.filter(g => g.classId === selectedClass && g.topicProposal);

  const filteredGroups = filterStatus === 'all' 
    ? groups 
    : groups.filter(g => g.topicProposal?.status === filterStatus);

  const handleReview = (action: 'approved' | 'revision_required' | 'rejected') => {
    console.log('Review action:', action, 'Feedback:', feedback);
    alert(`Đã ${action === 'approved' ? 'duyệt' : action === 'revision_required' ? 'yêu cầu chỉnh sửa' : 'từ chối'} đề xuất`);
    setSelectedProposal(null);
    setFeedback('');
  };

  const statusStats = {
    pending: groups.filter(g => g.topicProposal?.status === 'pending').length,
    approved: groups.filter(g => g.topicProposal?.status === 'approved').length,
    revision_required: groups.filter(g => g.topicProposal?.status === 'revision_required').length,
    rejected: groups.filter(g => g.topicProposal?.status === 'rejected').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Duyệt đề xuất chủ đề</h1>
        <p className="text-gray-600 mt-2">Xem xét và phê duyệt đề xuất từ các nhóm sinh viên</p>
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
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.pending}</p>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.approved}</p>
              <p className="text-sm text-gray-600">Đã duyệt</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.revision_required}</p>
              <p className="text-sm text-gray-600">Cần chỉnh sửa</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusStats.rejected}</p>
              <p className="text-sm text-gray-600">Từ chối</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({groups.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chờ duyệt ({statusStats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'approved' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã duyệt ({statusStats.approved})
          </button>
          <button
            onClick={() => setFilterStatus('revision_required')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'revision_required' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cần sửa ({statusStats.revision_required})
          </button>
        </div>
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map(group => {
          const proposal = group.topicProposal!;
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`p-4 ${
                proposal.status === 'approved' ? 'bg-emerald-50 border-b border-emerald-200' :
                proposal.status === 'pending' ? 'bg-yellow-50 border-b border-yellow-200' :
                proposal.status === 'revision_required' ? 'bg-orange-50 border-b border-orange-200' :
                'bg-red-50 border-b border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">Nhóm trưởng: {group.leaderName}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'revision_required' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {proposal.status === 'approved' ? 'Đã duyệt' :
                     proposal.status === 'pending' ? 'Chờ duyệt' :
                     proposal.status === 'revision_required' ? 'Cần sửa' : 'Từ chối'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{proposal.title}</h4>
                <p className="text-sm text-gray-700 mb-4">{proposal.description}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Mục tiêu:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {proposal.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Công nghệ:</h5>
                    <div className="flex flex-wrap gap-2">
                      {proposal.technologies.map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Thời gian:</h5>
                    <p className="text-sm text-gray-700">{proposal.timeline}</p>
                  </div>
                </div>

                {proposal.feedback && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">Phản hồi:</h5>
                    <p className="text-sm text-gray-700">{proposal.feedback}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedProposal({ group, proposal })}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có đề xuất nào</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'Chưa có nhóm nào nộp đề xuất chủ đề'
              : `Không có đề xuất nào ở trạng thái này`}
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Duyệt đề xuất chủ đề</h2>
              <p className="text-gray-600 mt-1">{selectedProposal.group.name}</p>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedProposal.proposal.title}</h3>
              <p className="text-gray-700 mb-6">{selectedProposal.proposal.description}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mục tiêu:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedProposal.proposal.objectives.map((obj: string, idx: number) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Công nghệ sử dụng:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.proposal.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Thời gian thực hiện:</h4>
                  <p className="text-gray-700">{selectedProposal.proposal.timeline}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phản hồi / Nhận xét:
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập phản hồi cho nhóm sinh viên..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview('approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Duyệt
                </button>
                <button
                  onClick={() => handleReview('revision_required')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                  Yêu cầu chỉnh sửa
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Từ chối
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setFeedback('');
                }}
                className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicProposalReview;
