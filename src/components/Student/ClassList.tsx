import React from 'react';
import { BookOpen, Users, FolderOpen, Calendar } from 'lucide-react';
import { Class } from '../../types';
import { mockClasses } from '../../data/mockData';

interface ClassListProps {
  onViewProjects: (classId: string) => void;
  onBack: () => void;
}

const ClassList: React.FC<ClassListProps> = ({ onViewProjects, onBack }) => {
  // Filter classes for current student (in real app, this would be based on enrollment)
  const enrolledClasses = mockClasses.filter(cls => cls.enrolledStudents.includes('3'));

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600 mt-1">View your enrolled classes and projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledClasses.map((cls) => (
          <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-600">{cls.semester} {cls.year}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {cls.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Instructor: {cls.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FolderOpen className="w-4 h-4" />
                  <span>{cls.projectCount} projects</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{cls.studentCount} students enrolled</span>
                </div>
              </div>

              <button
                onClick={() => onViewProjects(cls.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Projects
              </button>
            </div>
          </div>
        ))}
      </div>

      {enrolledClasses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
          <p className="text-gray-600">You are not currently enrolled in any classes.</p>
        </div>
      )}
    </div>
  );
};

export default ClassList;