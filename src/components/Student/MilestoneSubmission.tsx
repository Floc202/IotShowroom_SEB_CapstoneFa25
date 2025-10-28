import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Calendar, Download, Eye } from 'lucide-react';
import { mockGroups } from '../../data/mockData';

interface MilestoneSubmissionProps {
  onBack: () => void;
}

interface Submission {
  id: string;
  version: number;
  files: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  weight: number;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  submissions: Submission[];
  grade?: number;
}

const MilestoneSubmission: React.FC<MilestoneSubmissionProps> = ({ onBack }) => {
  const currentUserId = '3';
  
  // Find groups where student is member
  const studentGroups = mockGroups.filter(g => 
    g.members.some(m => m.id === currentUserId) && 
    g.topicProposal?.status === 'approved'
  );

  // Mock milestones data
  const [milestones] = useState<Milestone[]>([
    {
      id: 'ms1',
      name: 'Milestone 1: Requirements Analysis',
      description: 'Complete requirements documentation, use cases, and initial design',
      weight: 15,
      deadline: '2025-02-15',
      status: 'graded',
      grade: 85,
      submissions: [
        {
          id: 'sub1',
          version: 1,
          files: ['requirements_v1.pdf', 'use_cases.docx'],
          submittedAt: '2025-02-10 14:30',
          grade: 85,
          feedback: 'Good work! Requirements are well documented. Consider adding more edge cases.',
        },
      ],
    },
    {
      id: 'ms2',
      name: 'Milestone 2: System Design',
      description: 'Architecture diagram, database design, API specifications',
      weight: 20,
      deadline: '2025-03-10',
      status: 'submitted',
      submissions: [
        {
          id: 'sub2',
          version: 1,
          files: ['architecture_diagram.pdf', 'database_schema.sql', 'api_docs.md'],
          submittedAt: '2025-03-08 16:45',
        },
      ],
    },
    {
      id: 'ms3',
      name: 'Milestone 3: Implementation Phase 1',
      description: 'Core functionality implementation, backend APIs, database setup',
      weight: 25,
      deadline: '2025-04-15',
      status: 'in_progress',
      submissions: [],
    },
  ]);

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file!');
      return;
    }

    console.log('Submitting milestone:', {
      milestoneId: selectedMilestone?.id,
      files: selectedFiles.map(f => f.name),
      notes: submissionNotes,
      timestamp: new Date().toISOString(),
    });

    alert('Milestone submission successful! Your work has been uploaded.');
    setShowSubmitModal(false);
    setSelectedMilestone(null);
    setSelectedFiles([]);
    setSubmissionNotes('');
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Graded';
      case 'submitted':
        return 'Submitted - Pending Review';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Milestone Submissions</h1>
        <p className="text-gray-600 mt-2">Upload your work and track progress for each milestone</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Submission Guidelines:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You can resubmit multiple times before the deadline</li>
              <li>Only the latest submission will be graded</li>
              <li>Your topic proposal must be approved before submitting milestones</li>
              <li>Late submissions may receive penalty deductions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Check if student has approved topic */}
      {studentGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Topic</h3>
          <p className="text-gray-600">
            You need to have an approved topic proposal before you can submit milestones.
            Please create a group and submit a topic proposal first.
          </p>
        </div>
      ) : (
        <>
          {/* Progress Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Milestones</p>
                <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {milestones.filter(m => m.status === 'graded').length}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {milestones.filter(m => m.status === 'in_progress' || m.status === 'submitted').length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                <p className="text-2xl font-bold text-blue-600">
                  {milestones.filter(m => m.grade).length > 0
                    ? (milestones.reduce((sum, m) => sum + (m.grade || 0), 0) / 
                       milestones.filter(m => m.grade).length).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const latestSubmission = milestone.submissions[milestone.submissions.length - 1];
              const canSubmit = !isDeadlinePassed(milestone.deadline) || milestone.status === 'in_progress';
              const deadlineStatus = getDaysUntilDeadline(milestone.deadline);
              const isOverdue = deadlineStatus.includes('overdue');

              return (
                <div key={milestone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Milestone Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                        
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                            <Clock className="w-4 h-4" />
                            <span>{deadlineStatus}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-700 font-semibold">
                            <span>Weight: {milestone.weight}%</span>
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${getStatusColor(milestone.status)}`}>
                        {getStatusIcon(milestone.status)}
                        <span className="font-medium text-sm">
                          {getStatusText(milestone.status)}
                        </span>
                      </div>
                    </div>

                    {milestone.grade !== undefined && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Your Grade:</span>
                          <span className={`text-2xl font-bold ${milestone.grade >= 80 ? 'text-emerald-600' : milestone.grade >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {milestone.grade}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submissions History */}
                  <div className="p-6">
                    {milestone.submissions.length > 0 ? (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Submission History ({milestone.submissions.length})
                        </h4>
                        <div className="space-y-3">
                          {milestone.submissions.map((submission) => (
                            <div key={submission.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Version {submission.version}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Submitted: {submission.submittedAt}
                                  </p>
                                </div>
                                {submission.grade !== undefined && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-bold">{submission.grade}/100</span>
                                  </div>
                                )}
                              </div>

                              <div className="mb-2">
                                <p className="text-xs text-gray-600 mb-1">Files:</p>
                                <div className="flex flex-wrap gap-2">
                                  {submission.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs">
                                      <FileText className="w-3 h-3 text-gray-500" />
                                      <span>{file}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {submission.feedback && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">
                                    Instructor Feedback:
                                  </p>
                                  <p className="text-sm text-blue-800">{submission.feedback}</p>
                                </div>
                              )}

                              <div className="mt-3 flex gap-2">
                                <button className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No submissions yet</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {canSubmit ? (
                        <button
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setShowSubmitModal(true);
                          }}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          <Upload className="w-5 h-5" />
                          {latestSubmission ? 'Resubmit' : 'Submit Work'}
                        </button>
                      ) : (
                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-semibold">
                            Deadline has passed. Submissions are no longer accepted.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Submit Milestone</h2>
              <p className="text-gray-600 mt-1">{selectedMilestone.name}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Upload Files *
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Add any notes or comments about your submission..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Only your latest submission will be graded. Make sure all required files are included.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Upload className="w-5 h-5" />
                Submit
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedMilestone(null);
                  setSelectedFiles([]);
                  setSubmissionNotes('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneSubmission;
