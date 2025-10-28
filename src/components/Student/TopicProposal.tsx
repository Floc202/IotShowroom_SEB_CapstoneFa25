import React, { useState } from 'react';
import { FileText, Send, Edit2, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { mockGroups } from '../../data/mockData';

interface TopicProposalProps {
  onBack: () => void;
}

const TopicProposal: React.FC<TopicProposalProps> = ({ onBack }) => {
  const currentUserId = '3'; // Current student ID
  
  // Find groups where student is leader
  const leaderGroups = mockGroups.filter(g => 
    g.members.some(m => m.id === currentUserId && m.role === 'leader')
  );

  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: ['', '', ''],
    technologies: ['', '', ''],
    timeline: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'objectives' | 'technologies', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields!');
      return;
    }

    const objectives = formData.objectives.filter(obj => obj.trim() !== '');
    const technologies = formData.technologies.filter(tech => tech.trim() !== '');

    if (objectives.length === 0 || technologies.length === 0) {
      alert('Please add at least one objective and one technology!');
      return;
    }

    console.log('Submitting proposal:', {
      groupId: selectedGroup.id,
      ...formData,
      objectives,
      technologies,
    });

    alert('Topic proposal submitted successfully! Waiting for instructor review.');
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      objectives: ['', '', ''],
      technologies: ['', '', ''],
      timeline: '',
    });
  };

  const handleEditProposal = (group: any) => {
    setSelectedGroup(group);
    const proposal = group.topicProposal;
    setFormData({
      title: proposal.title,
      description: proposal.description,
      objectives: [...proposal.objectives, '', ''].slice(0, 3),
      technologies: [...proposal.technologies, '', ''].slice(0, 3),
      timeline: proposal.timeline,
    });
    setShowForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'revision_required':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 border-emerald-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'revision_required':
        return 'bg-orange-50 border-orange-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'revision_required':
        return 'Needs Revision';
      case 'rejected':
        return 'Rejected';
      default:
        return 'No Proposal';
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Topic Proposal</h1>
        <p className="text-gray-600 mt-2">Submit and manage your project topic proposals</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only group leaders can submit topic proposals</li>
              <li>Your group must have an approved topic before starting milestones</li>
              <li>If revision is required, you can edit and resubmit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Groups List */}
      {leaderGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups to Manage</h3>
          <p className="text-gray-600">
            You need to be a group leader to submit topic proposals.
            Create a group or wait to be assigned as a leader.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderGroups.map(group => {
            const proposal = group.topicProposal;
            const hasProposal = !!proposal;
            const canEdit = proposal?.status === 'revision_required' || !hasProposal;

            return (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {group.members.length} members
                      </p>
                    </div>
                    
                    {hasProposal && (
                      <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        <span className="font-medium text-sm">
                          {getStatusText(proposal.status)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposal Content */}
                <div className="p-6">
                  {hasProposal ? (
                    <>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">{proposal.title}</h4>
                      <p className="text-gray-700 mb-4">{proposal.description}</p>

                      <div className="space-y-3 mb-4">
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Objectives:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {proposal.objectives.map((obj: string, idx: number) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Technologies:</h5>
                          <div className="flex flex-wrap gap-2">
                            {proposal.technologies.map((tech: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Timeline:</h5>
                          <p className="text-sm text-gray-700">{proposal.timeline}</p>
                        </div>
                      </div>

                      {proposal.feedback && (
                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Instructor Feedback:</h5>
                          <p className="text-sm text-gray-700">{proposal.feedback}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {canEdit && (
                          <button
                            onClick={() => handleEditProposal(group)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            {proposal.status === 'revision_required' ? 'Revise & Resubmit' : 'Edit Proposal'}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Proposal Yet</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Submit a topic proposal to get started with your project
                      </p>
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowForm(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Create Proposal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proposal Form Modal */}
      {showForm && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedGroup.topicProposal ? 'Edit Topic Proposal' : 'Create Topic Proposal'}
              </h2>
              <p className="text-gray-600 mt-1">Group: {selectedGroup.name}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your project title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project idea, its purpose, and expected outcomes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Objectives *
                </label>
                <div className="space-y-2">
                  {formData.objectives.map((obj, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={obj}
                      onChange={(e) => handleArrayChange('objectives', idx, e.target.value)}
                      placeholder={`Objective ${idx + 1}...`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Technologies to Use *
                </label>
                <div className="space-y-2">
                  {formData.technologies.map((tech, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={tech}
                      onChange={(e) => handleArrayChange('technologies', idx, e.target.value)}
                      placeholder={`Technology ${idx + 1} (e.g., ESP32, MQTT, Node.js)...`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expected Timeline *
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 3 months: Jan - Mar 2025"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Once submitted, your proposal will be reviewed by the instructor. 
                  You cannot start working on milestones until your topic is approved.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Send className="w-5 h-5" />
                Submit Proposal
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedGroup(null);
                  setFormData({
                    title: '',
                    description: '',
                    objectives: ['', '', ''],
                    technologies: ['', '', ''],
                    timeline: '',
                  });
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

export default TopicProposal;
