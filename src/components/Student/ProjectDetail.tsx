import React, { useState } from 'react';
import { ArrowLeft, Upload, Play, Square, Thermometer, Droplets, Sun, Zap } from 'lucide-react';
import { Project, IoTData } from '../../types';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEvaluate?: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onEvaluate }) => {
  const [activeTab, setActiveTab] = useState('assets');
  const [demoActive, setDemoActive] = useState(false);

  // Mock IoT data
  const [iotData, setIotData] = useState<IoTData[]>([
    { timestamp: Date.now() - 300000, temperature: 22.5, humidity: 45, lightLevel: 320, motionDetected: false },
    { timestamp: Date.now() - 240000, temperature: 22.8, humidity: 46, lightLevel: 315, motionDetected: true },
    { timestamp: Date.now() - 180000, temperature: 23.1, humidity: 44, lightLevel: 322, motionDetected: false },
    { timestamp: Date.now() - 120000, temperature: 23.4, humidity: 43, lightLevel: 318, motionDetected: false },
    { timestamp: Date.now() - 60000, temperature: 23.2, humidity: 45, lightLevel: 325, motionDetected: true },
  ]);

  const toggleDemo = () => {
    setDemoActive(!demoActive);
    if (!demoActive) {
      // Simulate real-time data updates
      const interval = setInterval(() => {
        const newData: IoTData = {
          timestamp: Date.now(),
          temperature: 22 + Math.random() * 3,
          humidity: 40 + Math.random() * 10,
          lightLevel: 300 + Math.random() * 50,
          motionDetected: Math.random() > 0.8,
        };
        setIotData(prev => [...prev.slice(-19), newData]);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-emerald-100 text-emerald-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'evaluated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentSensorValue = (sensor: keyof IoTData) => {
    if (iotData.length === 0) return 0;
    const latest = iotData[iotData.length - 1];
    return latest[sensor];
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600 mt-1">{project.className}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            {onEvaluate && project.status === 'submitted' && (
              <button
                onClick={onEvaluate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Evaluate Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'assets', label: 'Assets' },
            { id: 'demo', label: 'Live Demo' },
            { id: 'feedback', label: 'Feedback' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {activeTab === 'assets' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Project Assets</h2>
              {!onEvaluate && (
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload More
                </button>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>

            <div className="space-y-6">
              {project.assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.assets.map((asset) => (
                    <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{formatFileSize(asset.size)}</span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assets uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload images, videos, or code files for your project</p>
                  {!onEvaluate && (
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Upload Assets
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Live IoT Demo</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  demoActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {demoActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={toggleDemo}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    demoActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {demoActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {demoActive ? 'Stop Demo' : 'Start Demo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">Temperature</p>
                    <p className="text-2xl font-bold text-red-900">{getCurrentSensorValue('temperature').toFixed(1)}°C</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Humidity</p>
                    <p className="text-2xl font-bold text-blue-900">{getCurrentSensorValue('humidity').toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Light Level</p>
                    <p className="text-2xl font-bold text-yellow-900">{getCurrentSensorValue('lightLevel').toFixed(0)} lux</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Motion</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {getCurrentSensorValue('motionDetected') ? 'Detected' : 'Clear'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sensor Data Timeline</h3>
              <div className="space-y-2">
                {iotData.slice(-10).reverse().map((data, index) => (
                  <div key={data.timestamp} className="flex items-center justify-between py-2 px-4 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>T: {data.temperature.toFixed(1)}°C</span>
                      <span>H: {data.humidity.toFixed(1)}%</span>
                      <span>L: {data.lightLevel.toFixed(0)} lux</span>
                      <span className={data.motionDetected ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {data.motionDetected ? 'Motion' : 'Still'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Instructor Feedback</h2>
            
            {project.evaluation ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-900">Final Score</h3>
                    <p className="text-sm text-blue-700">Overall project evaluation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">
                      {project.evaluation.totalScore}/{project.evaluation.maxScore}
                    </p>
                    <p className="text-sm text-blue-700">
                      {Math.round((project.evaluation.totalScore / project.evaluation.maxScore) * 100)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Evaluation Breakdown</h3>
                  <div className="space-y-3">
                    {project.evaluation.criteria.map((criteria, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{criteria.name}</p>
                          {criteria.comment && (
                            <p className="text-sm text-gray-600 mt-1">{criteria.comment}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {criteria.score}/{criteria.maxScore}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {project.evaluation.feedback && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Instructor Comments</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{project.evaluation.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                <p className="text-gray-600">Your instructor hasn't evaluated this project yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;