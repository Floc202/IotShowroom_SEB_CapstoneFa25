import React, { useState } from 'react';
import { Upload, X, Plus, Wifi, Radio } from 'lucide-react';

interface ProjectFormProps {
  onSave: (project: any) => void;
  onCancel: () => void;
  project?: any;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, project }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    classId: project?.classId || '',
    members: project?.members || [''],
    protocol: project?.demoConfig?.protocol || 'mqtt',
    demoUrl: project?.demoConfig?.demoUrl || '',
  });

  const [assets, setAssets] = useState(project?.assets || []);

  const classes = [
    { id: '1', name: 'IoT Fundamentals' },
    { id: '2', name: 'Sensor Networks' },
    { id: '3', name: 'IoT Applications' },
    { id: '4', name: 'Advanced IoT' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const addMember = () => {
    setFormData(prev => ({ ...prev, members: [...prev.members, ''] }));
  };

  const removeMember = (index: number) => {
    if (formData.members.length > 1) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, members: newMembers }));
    }
  };

  const handleFileUpload = (type: 'image' | 'video' | 'code') => {
    // Simulate file upload
    const mockAsset = {
      id: Date.now().toString(),
      type,
      name: `sample_${type}_file.${type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'zip'}`,
      url: '#',
      size: Math.floor(Math.random() * 5000000),
    };
    setAssets(prev => [...prev, mockAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  };

  const handleSubmit = (isDraft: boolean) => {
    const projectData = {
      ...formData,
      assets,
      status: isDraft ? 'draft' : 'submitted',
      demoConfig: {
        protocol: formData.protocol,
        demoUrl: formData.demoUrl,
      },
      submittedAt: isDraft ? undefined : new Date().toISOString(),
    };
    onSave(projectData);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <p className="text-gray-600 mt-1">Create and configure your IoT project submission</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your IoT project, its purpose, and functionality..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleInputChange('classId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Members
              </label>
              <div className="space-y-3">
                {formData.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={index === 0 ? "Your name (Lead)" : "Team member name"}
                    />
                    {index > 0 && (
                      <button
                        onClick={() => removeMember(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMember}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </button>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Project Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleFileUpload('image')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload Images</p>
                <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              </button>

              <button
                onClick={() => handleFileUpload('video')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload Videos</p>
                <p className="text-xs text-gray-500">MP4, AVI up to 100MB</p>
              </button>

              <button
                onClick={() => handleFileUpload('code')}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload Code</p>
                <p className="text-xs text-gray-500">ZIP, RAR up to 50MB</p>
              </button>
            </div>

            {assets.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(asset.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IoT Demo Configuration */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">IoT Demo Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Protocol
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputChange('protocol', 'mqtt')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.protocol === 'mqtt'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Radio className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">MQTT</p>
                  <p className="text-xs text-gray-500">Message Queuing</p>
                </button>

                <button
                  onClick={() => handleInputChange('protocol', 'websocket')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    formData.protocol === 'websocket'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Wifi className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">WebSocket</p>
                  <p className="text-xs text-gray-500">Real-time Communication</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-iot-demo.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL where your IoT demo can be accessed for live evaluation
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;