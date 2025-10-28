import React, { useState } from 'react';
import { Award, TrendingUp, Download, FileText, CheckCircle, Calendar, BarChart3 } from 'lucide-react';

interface GradeViewProps {
  onBack: () => void;
}

interface GradeItem {
  id: string;
  name: string;
  weight: number;
  grade: number;
  submittedDate: string;
  feedback: string;
  status: 'graded' | 'pending';
}

const GradeView: React.FC<GradeViewProps> = ({ onBack }) => {
  const [selectedSemester] = useState('Fall 2024');

  // Mock grades data
  const grades: GradeItem[] = [
    {
      id: '1',
      name: 'Milestone 1: Requirements Analysis',
      weight: 15,
      grade: 85,
      submittedDate: '2025-02-10',
      feedback: 'Good work! Requirements are well documented. Consider adding more edge cases.',
      status: 'graded',
    },
    {
      id: '2',
      name: 'Milestone 2: System Design',
      weight: 20,
      grade: 88,
      submittedDate: '2025-03-08',
      feedback: 'Excellent architecture design. Database schema is well-structured and normalized.',
      status: 'graded',
    },
    {
      id: '3',
      name: 'Milestone 3: Implementation Phase 1',
      weight: 25,
      grade: 90,
      submittedDate: '2025-04-12',
      feedback: 'Great implementation! Code is clean and well-documented. Good use of design patterns.',
      status: 'graded',
    },
    {
      id: '4',
      name: 'Final Project',
      weight: 40,
      grade: 92,
      submittedDate: '2025-05-20',
      feedback: 'Excellent work! Your IoT system is well-designed and implemented. The documentation is comprehensive.',
      status: 'graded',
    },
  ];

  // Calculate weighted total
  const totalGrade = grades.reduce((sum, item) => {
    return sum + (item.grade * item.weight / 100);
  }, 0);

  const totalWeight = grades.reduce((sum, item) => sum + item.weight, 0);

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-emerald-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (grade: number) => {
    if (grade >= 90) return 'bg-emerald-50 border-emerald-200';
    if (grade >= 80) return 'bg-blue-50 border-blue-200';
    if (grade >= 70) return 'bg-yellow-50 border-yellow-200';
    if (grade >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getLetterGrade = (grade: number) => {
    if (grade >= 90) return 'A';
    if (grade >= 85) return 'A-';
    if (grade >= 80) return 'B+';
    if (grade >= 75) return 'B';
    if (grade >= 70) return 'B-';
    if (grade >= 65) return 'C+';
    if (grade >= 60) return 'C';
    if (grade >= 55) return 'C-';
    if (grade >= 50) return 'D';
    return 'F';
  };

  const downloadReport = () => {
    alert('Downloading complete grade report as PDF...');
    console.log('Download grade report PDF');
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
        <h1 className="text-3xl font-bold text-gray-900">Grades & Results</h1>
        <p className="text-gray-600 mt-2">View your semester grades and performance analytics</p>
      </div>

      {/* Semester Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Select Semester</label>
        <select 
          value={selectedSemester}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option>Fall 2024</option>
          <option>Spring 2024</option>
          <option>Fall 2023</option>
        </select>
      </div>

      {/* Overall Grade Summary */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Semester Performance</h2>
            </div>
            <p className="text-blue-100 mb-6">IoT Capstone Project - {selectedSemester}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Total Assignments</p>
                <p className="text-3xl font-bold">{grades.length}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold">{grades.filter(g => g.status === 'graded').length}</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-blue-100 text-sm mb-1">Average Grade</p>
                <p className="text-3xl font-bold">
                  {(grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-8 text-center bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">Final Grade</p>
            <p className={`text-7xl font-bold mb-2 ${getGradeColor(totalGrade)}`}>
              {totalGrade.toFixed(1)}
            </p>
            <p className={`text-3xl font-bold mb-1 ${getGradeColor(totalGrade)}`}>
              {getLetterGrade(totalGrade)}
            </p>
            <p className="text-xs text-gray-500">Out of {totalWeight}%</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">On Track</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Report Button */}
      <div className="mb-6">
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold shadow-sm"
        >
          <Download className="w-5 h-5" />
          Download Complete Report (PDF)
        </button>
      </div>

      {/* Grade Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Grade Breakdown</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {grades.map((item) => {
              const weightedScore = (item.grade * item.weight / 100).toFixed(1);
              
              return (
                <div key={item.id} className={`border-2 rounded-xl overflow-hidden ${getGradeBgColor(item.grade)}`}>
                  {/* Grade Item Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>Submitted: {new Date(item.submittedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-purple-700">
                            <span>Weight: {item.weight}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Graded</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <p className="text-sm text-gray-600 mb-1">Grade</p>
                        <p className={`text-4xl font-bold ${getGradeColor(item.grade)}`}>
                          {item.grade}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">out of 100</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Performance</span>
                        <span className={`font-bold ${getGradeColor(item.grade)}`}>
                          {item.grade}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.grade >= 90 ? 'bg-emerald-500' :
                            item.grade >= 80 ? 'bg-blue-500' :
                            item.grade >= 70 ? 'bg-yellow-500' :
                            item.grade >= 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.grade}%` }}
                        />
                      </div>
                    </div>

                    {/* Weighted Contribution */}
                    <div className="p-3 bg-white rounded-lg border border-gray-300 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          Contribution to Final Grade:
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {weightedScore} points
                        </span>
                      </div>
                    </div>

                    {/* Feedback */}
                    {item.feedback && (
                      <div className="p-4 bg-white rounded-lg border border-gray-300">
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Instructor Feedback:
                            </p>
                            <p className="text-sm text-gray-700">{item.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="space-y-3">
            {grades.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 truncate max-w-[200px]">{item.name.split(':')[1]?.trim() || item.name}</span>
                  <span className={`font-bold ${getGradeColor(item.grade)}`}>
                    {item.grade}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.grade >= 90 ? 'bg-emerald-500' :
                      item.grade >= 80 ? 'bg-blue-500' :
                      item.grade >= 70 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${item.grade}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Contribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Contribution</h3>
          <div className="space-y-4">
            {grades.map((item) => {
              const contribution = (item.grade * item.weight / 100);
              const percentage = (contribution / totalGrade * 100);
              
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-medium">
                        {item.weight}%
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {contribution.toFixed(1)} pts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-purple-600">
                {totalGrade.toFixed(1)} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Your performance is <span className="font-semibold text-emerald-700">above average</span> across all milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Strongest area: <span className="font-semibold text-blue-700">Final Project (92/100)</span></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Consistent improvement throughout the semester</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeView;
