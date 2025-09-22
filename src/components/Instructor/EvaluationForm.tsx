import React, { useState } from 'react';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { Project, EvaluationCriteria } from '../../types';

interface EvaluationFormProps {
  project: Project;
  onSave: (evaluation: any) => void;
  onBack: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ project, onSave, onBack }) => {
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
    { name: 'Technical Implementation', maxScore: 25, score: 0, comment: '' },
    { name: 'Innovation & Creativity', maxScore: 25, score: 0, comment: '' },
    { name: 'Documentation', maxScore: 25, score: 0, comment: '' },
    { name: 'Presentation & Demo', maxScore: 25, score: 0, comment: '' },
  ]);
  
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateCriteria = (index: number, field: keyof EvaluationCriteria, value: string | number) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
  };

  const totalScore = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
  const maxScore = criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const handleSave = async (isDraft: boolean) => {
    setIsLoading(true);
    
    const evaluation = {
      id: Date.now().toString(),
      projectId: project.id,
      instructorId: '2', // Current instructor ID
      instructorName: 'Dr. Sarah Johnson',
      criteria,
      totalScore,
      maxScore,
      feedback,
      createdAt: new Date().toISOString(),
      status: isDraft ? 'draft' : 'submitted',
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(evaluation);
    setIsLoading(false);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluate Project</h1>
          <p className="text-gray-600 mt-1">{project.title} by {project.studentName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evaluation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Evaluation Criteria</h2>
            
            <div className="space-y-6">
              {criteria.map((criterion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={criterion.maxScore}
                        value={criterion.score}
                        onChange={(e) => updateCriteria(index, 'score', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">/ {criterion.maxScore}</span>
                    </div>
                  </div>
                  
                  <textarea
                    value={criterion.comment}
                    onChange={(e) => updateCriteria(index, 'comment', e.target.value)}
                    placeholder="Add comments for this criterion..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Overall Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide overall feedback on the project..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h3>
            
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold mb-2 ${getGradeColor(percentage)}`}>
                {totalScore}/{maxScore}
              </div>
              <div className={`text-2xl font-semibold ${getGradeColor(percentage)}`}>
                {percentage}%
              </div>
            </div>

            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{criterion.name}</span>
                  <span className="font-medium">
                    {criterion.score}/{criterion.maxScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Student:</span>
                <span className="ml-2 font-medium">{project.studentName}</span>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <span className="ml-2 font-medium">{project.className}</span>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <span className="ml-2 font-medium">
                  {project.submittedAt 
                    ? new Date(project.submittedAt).toLocaleDateString()
                    : 'Not submitted'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-600">Assets:</span>
                <span className="ml-2 font-medium">{project.assets.length} files</span>
              </div>
              <div>
                <span className="text-gray-600">Demo:</span>
                <span className="ml-2 font-medium">
                  {project.demoConfig.demoUrl ? 'Available' : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              onClick={() => handleSave(false)}
              disabled={isLoading || totalScore === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;