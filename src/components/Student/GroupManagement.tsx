import React, { useState } from 'react';
import { Users, UserPlus, Mail, CheckCircle, XCircle, Crown, AlertCircle } from 'lucide-react';
import { mockGroups, mockUsers, mockClasses } from '../../data/mockData';

interface GroupManagementProps {
  onBack: () => void;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ onBack }) => {
  const currentUserId = '3'; // Current student ID
  const currentUser = mockUsers.find(u => u.id === currentUserId);
  
  // Find groups where student is a member
  const myGroups = mockGroups.filter(g => 
    g.members.some(m => m.id === currentUserId)
  );

  // Find student's classes
  const studentClasses = mockClasses.filter(c => 
    c.students?.includes(currentUserId)
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock invitations
  const [invitations, setInvitations] = useState([
    {
      id: '1',
      groupName: 'AI Vision Team',
      className: 'Advanced IoT',
      invitedBy: 'John Smith',
      invitedAt: '2025-01-15',
      status: 'pending',
    },
  ]);

  const handleCreateGroup = () => {
    if (!groupName || !selectedClass) {
      alert('Please fill in all required fields!');
      return;
    }

    console.log('Creating group:', { groupName, groupDescription, selectedClass });
    alert('Group created successfully! You are now the group leader.');
    setShowCreateModal(false);
    setGroupName('');
    setGroupDescription('');
    setSelectedClass('');
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      alert('Please enter an email address!');
      return;
    }

    console.log('Sending invitation to:', inviteEmail);
    alert(`Invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleAcceptInvite = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    alert('You have joined the group!');
  };

  const handleRejectInvite = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    alert('Invitation declined.');
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      console.log('Removing member:', memberId);
      alert('Member removed from group.');
    }
  };

  const isLeader = (group: any) => {
    const member = group.members.find((m: any) => m.id === currentUserId);
    return member?.role === 'leader';
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
        <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
        <p className="text-gray-600 mt-2">Manage your project groups and team members</p>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-yellow-600" />
            Pending Group Invitations ({invitations.length})
          </h2>
          <div className="space-y-3">
            {invitations.map(invitation => (
              <div key={invitation.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{invitation.groupName}</h3>
                    <p className="text-sm text-gray-600">Class: {invitation.className}</p>
                    <p className="text-sm text-gray-600">Invited by: {invitation.invitedBy}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(invitation.invitedAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invitation.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectInvite(invitation.id)}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Create New Group
        </button>
      </div>

      {/* My Groups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Groups</h2>
        
        {myGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">
              Create a new group or wait for an invitation from your classmates
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Create New Group
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myGroups.map(group => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                      {isLeader(group) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          <Crown className="w-3 h-3" />
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <p className="text-xs text-gray-500">
                      {group.members.length}/{group.maxMembers} members
                    </p>
                  </div>
                  {isLeader(group) && (
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowInviteModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Invite Member
                    </button>
                  )}
                </div>

                {/* Group Status */}
                {group.topicProposal && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Topic Status:</span>
                      <span className={`text-sm px-2 py-0.5 rounded-full ${
                        group.topicProposal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        group.topicProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        group.topicProposal.status === 'revision_required' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.topicProposal.status === 'approved' ? 'Approved' :
                         group.topicProposal.status === 'pending' ? 'Pending Review' :
                         group.topicProposal.status === 'revision_required' ? 'Needs Revision' : 'Rejected'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Members:</h4>
                  <div className="space-y-2">
                    {group.members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {member.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {member.studentName}
                              {member.role === 'leader' && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  Leader
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        {isLeader(group) && member.role !== 'leader' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Group</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class *
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a class...</option>
                  {studentClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe your group..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ You will become the group leader and can invite other members after creation.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Group
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setGroupName('');
                  setGroupDescription('');
                  setSelectedClass('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Member</h2>
            <p className="text-gray-600 mb-4">
              Invite a classmate to join <strong>{selectedGroup?.name}</strong>
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ The student must be in the same class to join your group.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendInvite}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Send Invitation
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setSelectedGroup(null);
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

export default GroupManagement;
