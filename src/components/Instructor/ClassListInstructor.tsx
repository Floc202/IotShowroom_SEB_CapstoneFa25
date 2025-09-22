import React from 'react';
import { BookOpen, Users, FolderOpen, Calendar, Eye } from 'lucide-react';
import { Class } from '../../types';
import { mockClasses } from '../../data/mockData';

interface ClassListInstructorProps {
  onViewProjects: (classId: string) => void;
  onBack: () => void;
}

const ClassListInstructor: React.FC<ClassListInstructorProps> = ({ onViewProjects, onBack }) => {
  // Filter classes for current instructor (in real app, this would be based on instructor ID)
  const instructorClasses = mockClasses.filter(cls => cls.instructorId === '2');

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
        <p className="text-gray-600 mt-1">Manage your assigned classes and student projects</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Class Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Semester</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Students</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Projects</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instructorClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cls.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{cls.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{cls.semester} {cls.year}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{cls.studentCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FolderOpen className="w-4 h-4" />
                      <span>{cls.projectCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      cls.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewProjects(cls.id)}
                      className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Projects
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {instructorClasses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
          <p className="text-gray-600">You don't have any classes assigned yet.</p>
        </div>
      )}
    </div>
  );
};

export default ClassListInstructor;