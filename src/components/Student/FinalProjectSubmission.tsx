import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, File, Code, Presentation, Settings } from 'lucide-react';

interface FinalProjectSubmissionProps {
  onBack: () => void;
}

interface FinalSubmission {
  report?: File | null;
  slides?: File | null;
  sourceCode?: File | null;
  iotConfig?: File | null;
  notes: string;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

const FinalProjectSubmission: React.FC<FinalProjectSubmissionProps> = ({ onBack }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<FinalSubmission>({
    report: null,
    slides: null,
    sourceCode: null,
    iotConfig: null,
    notes: '',
    submittedAt: '2025-05-20 15:30',
    grade: 92,
    feedback: 'Excellent work! Your IoT system is well-designed and implemented. The documentation is comprehensive. Minor improvements suggested in error handling for network failures.',
  });

  const handleFileChange = (field: keyof FinalSubmission, file: File | null) => {
    setSubmission(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = () => {
    const { report, slides, sourceCode, iotConfig } = submission;

    if (!report || !slides || !sourceCode || !iotConfig) {
      alert('Please upload all required files before submitting!');
      return;
    }

    console.log('Submitting final project:', {
      report: report.name,
      slides: slides.name,
      sourceCode: sourceCode.name,
      iotConfig: iotConfig.name,
      notes: submission.notes,
      timestamp: new Date().toISOString(),
    });

    alert('Final project submitted successfully! Good luck with your presentation.');
    setHasSubmitted(true);
  };

  const downloadSubmission = () => {
    alert('Downloading your submission as PDF...');
    console.log('Download PDF of final submission');
  };

  const FileUploadSection = ({ 
    icon: Icon, 
    title, 
    description, 
    field, 
    accept,
    color 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    field: keyof FinalSubmission;
    accept: string;
    color: string;
  }) => {
    const file = submission[field] as File | null;

    return (
      <div className={`p-6 border-2 border-dashed rounded-xl ${hasSubmitted ? 'bg-gray-50 border-gray-300' : `${color} border-gray-300 hover:border-blue-400`} transition-all`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${hasSubmitted ? 'bg-gray-200' : 'bg-white shadow-sm'}`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            
            {file ? (
              <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                {!hasSubmitted && (
                  <button
                    onClick={() => handleFileChange(field, null)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              !hasSubmitted && (
                <label className="block">
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        handleFileChange(field, selectedFile);
                      }
                    }}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 focus:outline-none p-2"
                  />
                </label>
              )
            )}
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Final Project Submission</h1>
        <p className="text-gray-600 mt-2">Submit your complete project deliverables (Worth 40% of final grade)</p>
      </div>

      {/* Weight Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Final Project Weight: 40%</h3>
            <p className="text-gray-700">
              This is the most important submission of the semester. Make sure all deliverables are complete and polished.
            </p>
          </div>
          {hasSubmitted && submission.grade !== undefined && (
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Your Grade</p>
              <p className={`text-4xl font-bold ${submission.grade >= 80 ? 'text-emerald-600' : submission.grade >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {submission.grade}
              </p>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Required Deliverables:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><span className="font-semibold">Project Report:</span> PDF or Word document (10-15 pages) covering requirements, design, implementation, testing, and conclusions</li>
              <li><span className="font-semibold">Presentation Slides:</span> PowerPoint or PDF (15-20 slides) for your final presentation</li>
              <li><span className="font-semibold">Source Code:</span> ZIP file containing all project code, organized with clear folder structure</li>
              <li><span className="font-semibold">IoT Configuration:</span> Configuration files, setup instructions, and deployment guide for your IoT devices</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload Deliverables</h2>
          <p className="text-gray-600">All files are required for submission</p>
        </div>

        <div className="p-6 space-y-4">
          <FileUploadSection
            icon={File}
            title="Project Report *"
            description="Comprehensive documentation of your project (PDF or Word)"
            field="report"
            accept=".pdf,.doc,.docx"
            color="bg-red-50"
          />

          <FileUploadSection
            icon={Presentation}
            title="Presentation Slides *"
            description="Slides for your final presentation (PowerPoint or PDF)"
            field="slides"
            accept=".ppt,.pptx,.pdf"
            color="bg-orange-50"
          />

          <FileUploadSection
            icon={Code}
            title="Source Code *"
            description="Complete source code with documentation (ZIP file)"
            field="sourceCode"
            accept=".zip,.rar,.7z"
            color="bg-green-50"
          />

          <FileUploadSection
            icon={Settings}
            title="IoT Configuration *"
            description="Device configuration, setup guide, and deployment instructions"
            field="iotConfig"
            accept=".zip,.rar,.7z,.pdf,.md"
            color="bg-blue-50"
          />

          {/* Additional Notes */}
          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={submission.notes}
              onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any comments or special instructions about your submission..."
              rows={4}
              disabled={hasSubmitted}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasSubmitted ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Submit Button */}
        {!hasSubmitted && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start gap-4 mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Important:</span> Once you submit, you cannot modify your files. 
                Make sure everything is complete and correct before clicking Submit.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg"
            >
              <Upload className="w-6 h-6" />
              Submit Final Project
            </button>
          </div>
        )}

        {/* Submission Confirmation */}
        {hasSubmitted && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">
                  Final Project Submitted Successfully!
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  Submitted on: {submission.submittedAt}
                </p>
              </div>
            </div>

            {submission.feedback && (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Instructor Feedback:
                </h4>
                <p className="text-blue-800">{submission.feedback}</p>
              </div>
            )}

            <button
              onClick={downloadSubmission}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Download Submission Summary (PDF)
            </button>
          </div>
        )}
      </div>

      {/* Grading Breakdown */}
      {hasSubmitted && submission.grade !== undefined && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Grading Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Project Report</p>
                <p className="text-2xl font-bold text-blue-600">90/100</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Presentation Quality</p>
                <p className="text-2xl font-bold text-purple-600">95/100</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Code Quality</p>
                <p className="text-2xl font-bold text-green-600">92/100</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">IoT Implementation</p>
                <p className="text-2xl font-bold text-orange-600">91/100</p>
              </div>
            </div>
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Final Project Grade (40% of total)</p>
                  <p className="text-xs text-gray-500">Average of all components</p>
                </div>
                <p className="text-5xl font-bold text-emerald-600">{submission.grade}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalProjectSubmission;
