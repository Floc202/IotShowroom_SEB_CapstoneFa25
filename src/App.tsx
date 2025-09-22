import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import Sidebar from './components/Layout/Sidebar';
import StudentDashboard from './components/Student/StudentDashboard';
import ClassList from './components/Student/ClassList';
import NotificationsPage from './components/Student/NotificationsPage';
import ProfileSettings from './components/Student/ProfileSettings';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import ClassListInstructor from './components/Instructor/ClassListInstructor';
import ProjectListInstructor from './components/Instructor/ProjectListInstructor';
import EvaluationForm from './components/Instructor/EvaluationForm';
import AnnouncementsPage from './components/Instructor/AnnouncementsPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import ReportsPage from './components/Admin/ReportsPage';
import ProjectForm from './components/Student/ProjectForm';
import ProjectDetail from './components/Student/ProjectDetail';
import { mockProjects } from './data/mockData';


const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);

  if (!user) {
    if (showForgotPassword) {
      return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
    }
    return <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />;
  }

  const handleNavigate = (item: string) => {
    setActiveItem(item);
    setSelectedClassId(null);
    setShowProjectForm(false);
    setShowProjectDetail(false);
    setShowEvaluationForm(false);
    setCurrentProject(null);
  };

  const handleViewProjects = (classId: string) => {
    setSelectedClassId(classId);
    setActiveItem('projects');
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setShowProjectForm(true);
  };

  const handleViewProject = (project: any) => {
    setCurrentProject(project);
    setShowProjectDetail(true);
    setShowEvaluationForm(false);
  };

  const handleEvaluateProject = (project: any) => {
    setCurrentProject(project);
    setShowEvaluationForm(true);
    setShowProjectDetail(false);
  };

  const handleSaveProject = (projectData: any) => {
    console.log('Saving project:', projectData);
    setShowProjectForm(false);
    setActiveItem('projects');
    // In a real app, this would save to a backend
  };

  const handleSaveEvaluation = (evaluation: any) => {
    console.log('Saving evaluation:', evaluation);
    setShowEvaluationForm(false);
    setShowProjectDetail(false);
    setActiveItem('evaluation');
    // In a real app, this would save to a backend
  };

  const renderContent = () => {
    if (showProjectForm) {
      return (
        <ProjectForm
          project={currentProject}
          onSave={handleSaveProject}
          onCancel={() => setShowProjectForm(false)}
        />
      );
    }

    if (showEvaluationForm && currentProject) {
      return (
        <EvaluationForm
          project={currentProject}
          onSave={handleSaveEvaluation}
          onBack={() => setShowEvaluationForm(false)}
        />
      );
    }

    if (showProjectDetail && currentProject) {
      return (
        <ProjectDetail
          project={currentProject}
          onBack={() => setShowProjectDetail(false)}
          onEvaluate={user.role === 'instructor' ? () => handleEvaluateProject(currentProject) : undefined}
        />
      );
    }

    switch (activeItem) {
      case 'dashboard':
        if (user.role === 'student') {
          return <StudentDashboard onNavigate={handleNavigate} />;
        } else if (user.role === 'instructor') {
          return <InstructorDashboard onNavigate={handleNavigate} />;
        } else if (user.role === 'admin') {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        break;
      
      case 'classes':
        if (user.role === 'student') {
          return <ClassList onViewProjects={handleViewProjects} onBack={() => handleNavigate('dashboard')} />;
        } else if (user.role === 'instructor') {
          return <ClassListInstructor onViewProjects={handleViewProjects} onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'notifications':
        if (user.role === 'student') {
          return <NotificationsPage onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'profile':
        if (user.role === 'student') {
          return <ProfileSettings onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'evaluation':
        if (user.role === 'instructor') {
          return (
            <ProjectListInstructor
              onViewProject={handleViewProject}
              onBack={() => handleNavigate('dashboard')}
            />
          );
        }
        break;

      case 'announcements':
        if (user.role === 'instructor' || user.role === 'admin') {
          return <AnnouncementsPage onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'users':
        if (user.role === 'admin') {
          return <UserManagement onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'reports':
        if (user.role === 'admin') {
          return <ReportsPage onBack={() => handleNavigate('dashboard')} />;
        }
        break;

      case 'projects':
        if (user.role === 'student') {
          return (
            <div className="p-8">
              <div className="mb-6">
                {selectedClassId && (
                  <button
                    onClick={() => handleNavigate('classes')}
                    className="text-blue-600 hover:text-blue-800 font-medium mb-4"
                  >
                    ← Back to Classes
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                    <p className="text-gray-600 mt-1">Manage your IoT project submissions</p>
                  </div>
                  <button
                    onClick={handleNewProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Project
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="space-y-4">
                    {mockProjects
                      .filter(project => !selectedClassId || project.classId === selectedClassId)
                      .map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.className}</p>
                          <p className="text-xs text-gray-500">
                            {project.submittedAt ? `Submitted ${new Date(project.submittedAt).toLocaleDateString()}` : 'Draft'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'evaluated' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                          <div className="mt-2">
                            <button
                              onClick={() => handleViewProject(project)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                            >
                              View
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (user.role === 'instructor') {
          return (
            <ProjectListInstructor
              classId={selectedClassId || undefined}
              onViewProject={handleViewProject}
              onBack={() => selectedClassId ? handleNavigate('classes') : handleNavigate('dashboard')}
            />
          );
        }
        break;
      
      default:
        return (
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Page
              </h2>
              <p className="text-gray-600">
                This section is under development. More features coming soon!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem={activeItem} onItemClick={handleNavigate} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;