import React, { useState } from 'react';
import { FileCheck, Calendar, Users, Star, MessageSquare, Download } from 'lucide-react';
import { mockMilestones, mockClasses, mockGroups } from '../../data/mockData';

const GradingPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('1');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const instructorClasses = mockClasses.filter(c => c.instructorId === '2');
  const milestones = mockMilestones.filter(m => m.classId === selectedClass);
  
  const filteredMilestones = selectedMilestone === 'all' 
    ? milestones 
    : milestones.filter(m => m.id === selectedMilestone);

  const allSubmissions = filteredMilestones.flatMap(milestone => 
    milestone.submissions.map(sub => {
      const group = mockGroups.find(g => g.id === sub.groupId);
      return {
        ...sub,
        milestoneName: milestone.name,
        milestoneWeight: milestone.weight,
        milestoneId: milestone.id,
        groupName: group?.name || 'Unknown Group',
        groupLeader: group?.leaderName || 'Unknown',
      };
    })
  );

  const pendingSubmissions = allSubmissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = allSubmissions.filter(s => s.status === 'graded');

  const handleGrade = () => {
    if (!score || !feedback) {
      alert('Please enter both score and feedback!');
      return;
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > selectedSubmission.milestoneWeight) {
      alert(`Score must be between 0 and ${selectedSubmission.milestoneWeight}!`);
      return;
    }

    console.log('Grading:', {
      submissionId: selectedSubmission.id,
      score: numScore,
      feedback,
    });

    alert('Successfully graded!');
    setSelectedSubmission(null);
    setScore('');
    setFeedback('');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Grade Milestones</h1>
        <p className="text-gray-600 mt-2">Grade and provide feedback for student submissions</p>
      </div>

      {/* Class and Milestone Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedMilestone('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {instructorClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.semester} {cls.year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Milestone
            </label>
            <select
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Milestones</option>
              {milestones.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.weight}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Graded</p>
            <p className="text-2xl font-bold text-emerald-600">{gradedSubmissions.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-blue-600">{allSubmissions.length}</p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-orange-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-600" />
                Pending Grading ({pendingSubmissions.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{submission.groupName}</h3>
                        <p className="text-sm text-gray-600">
                          {submission.milestoneName} • Weight: {submission.milestoneWeight}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Leader: {submission.groupLeader}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                        Pending
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-US')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-4 h-4" />
                        {submission.documents.length} documents
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Grade
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Documents
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Graded Submissions */}
        {gradedSubmissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-emerald-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600" />
                Graded ({gradedSubmissions.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {gradedSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{submission.groupName}</h3>
                        <p className="text-sm text-gray-600">
                          {submission.milestoneName} • Weight: {submission.milestoneWeight}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Leader: {submission.groupLeader}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {submission.score}/{submission.milestoneWeight}
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round((submission.score! / submission.milestoneWeight) * 100)}%
                        </p>
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-3">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Feedback:</p>
                        <p className="text-sm text-gray-700">{submission.feedback}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {allSubmissions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-600">
              No students have submitted work for this milestone
            </p>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Grade Milestone</h2>
              <p className="text-gray-600 mt-1">{selectedSubmission.groupName}</p>
            </div>

            <div className="p-6">
              {/* Submission Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedSubmission.milestoneName}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Leader: {selectedSubmission.groupLeader}</p>
                  <p>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleDateString('en-US')}</p>
                  <p>Weight: {selectedSubmission.milestoneWeight}%</p>
                  <p>Documents: {selectedSubmission.documents.length}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Submitted Documents:</h4>
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Score (Maximum: {selectedSubmission.milestoneWeight} points)
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.milestoneWeight}
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder={`Enter score from 0 to ${selectedSubmission.milestoneWeight}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                />
              </div>

              {/* Feedback Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Feedback / Comments
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter detailed feedback for the student group..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleGrade}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Save Grade
                </button>
                <button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setScore('');
                    setFeedback('');
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                ⚠️ After publishing grades, you cannot edit them
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingPage;
