import React, { useState } from 'react';
import { Settings, Database, Mail, FileText, Save, Download, Upload } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'iot-system@university.edu',
    smtpPassword: '••••••••',
  });

  const [emailTemplates, setEmailTemplates] = useState({
    joinRequest: `Dear {instructor_name},

Student {student_name} ({student_email}) has requested to join group "{group_name}" in class {class_name}.

Please review and respond to this request.

Best regards,
IoT Projects System`,
    
    proposalApproved: `Dear {leader_name},

Your topic proposal "{proposal_title}" has been approved by {instructor_name}.

You can now proceed with your project implementation.

Best regards,
IoT Projects System`,

    milestoneGraded: `Dear {student_name},

Your milestone "{milestone_name}" has been graded.

Score: {score}/{max_score}
Feedback: {feedback}

Best regards,
IoT Projects System`,
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'IoT Projects Management System',
    maxFileSize: 50, // MB
    sessionTimeout: 60, // minutes
    backupFrequency: 'daily',
    maintenanceMode: false,
  });

  const handleBackupNow = () => {
    alert('Starting backup process...\nThis will backup all system data including users, classes, projects, and grades.');
    // Simulate backup
    setTimeout(() => {
      alert('✅ Backup completed successfully!\nBackup file: backup_' + new Date().toISOString().split('T')[0] + '.sql');
    }, 2000);
  };

  const handleSaveEmailSettings = () => {
    alert('Email settings saved successfully!');
  };

  const handleSaveTemplate = (templateName: string) => {
    alert(`Email template "${templateName}" saved successfully!`);
  };

  const handleSaveSystemSettings = () => {
    alert('System settings saved successfully!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              General Settings
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={systemSettings.backupFrequency}
                  onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="maintenance" className="text-sm font-medium text-gray-900">
                  Enable Maintenance Mode
                  <p className="text-xs text-gray-600 mt-1">
                    When enabled, only admins can access the system
                  </p>
                </label>
              </div>

              <button
                onClick={handleSaveSystemSettings}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Save General Settings
              </button>
            </div>
          </div>
        </div>

        {/* Backup & Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-600" />
              Backup & Data Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Database Backup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a complete backup of all system data including users, classes, projects, grades, and settings.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackupNow}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Backup Now
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <Upload className="w-5 h-5" />
                    Restore from Backup
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Last Backup</h3>
                <p className="text-sm text-gray-600">
                  Date: 2025-10-27 23:00:00 <br />
                  Size: 245 MB <br />
                  Status: ✓ Successful
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-600" />
              Email Server Configuration
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="587"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="email"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-email@university.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleSaveEmailSettings}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />
                Save Email Settings
              </button>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              Email Templates
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Join Request Template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Join Request Notification
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Variables: {'{instructor_name}'}, {'{student_name}'}, {'{student_email}'}, {'{group_name}'}, {'{class_name}'}
                </p>
                <textarea
                  value={emailTemplates.joinRequest}
                  onChange={(e) => setEmailTemplates({...emailTemplates, joinRequest: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={() => handleSaveTemplate('Join Request')}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Save Template
                </button>
              </div>

              {/* Proposal Approved Template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Proposal Approved Notification
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Variables: {'{leader_name}'}, {'{proposal_title}'}, {'{instructor_name}'}
                </p>
                <textarea
                  value={emailTemplates.proposalApproved}
                  onChange={(e) => setEmailTemplates({...emailTemplates, proposalApproved: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={() => handleSaveTemplate('Proposal Approved')}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Save Template
                </button>
              </div>

              {/* Milestone Graded Template */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Milestone Graded Notification
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Variables: {'{student_name}'}, {'{milestone_name}'}, {'{score}'}, {'{max_score}'}, {'{feedback}'}
                </p>
                <textarea
                  value={emailTemplates.milestoneGraded}
                  onChange={(e) => setEmailTemplates({...emailTemplates, milestoneGraded: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  onClick={() => handleSaveTemplate('Milestone Graded')}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
