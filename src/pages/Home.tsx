import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Users,
  GraduationCap,
  Shield,
  TrendingUp,
  Zap,
  Database,
  Wifi,
  BarChart3,
  Search,
  Play,
  Cpu,
  Radio,
  FolderOpen,
} from 'lucide-react';
import { getProjectsBySemester } from '../api/project';
import { listSemesters } from '../api/semesters';
import type { SemesterProjectDetail } from '../types/project';
import type { Semester } from '../types/semesters';
import ProjectCard from '../components/project/ProjectCard';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Home = () => {
  const [activeRole, setActiveRole] = useState<'admin' | 'instructor' | 'student'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Array<SemesterProjectDetail & { semesterId: number }>>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const semestersRes = await listSemesters();
        if (semestersRes.isSuccess && semestersRes.data) {
          setSemesters(semestersRes.data);
          
          const projectPromises = semestersRes.data.map(semester => 
            getProjectsBySemester(semester.semesterId).then(res => ({
              semesterId: semester.semesterId,
              response: res
            }))
          );
          
          const projectResponses = await Promise.all(projectPromises);
          const allProjects: Array<SemesterProjectDetail & { semesterId: number }> = [];
          
          projectResponses.forEach(({ semesterId, response }) => {
            if (response.isSuccess && response.data) {
              response.data.projects.forEach(project => {
                allProjects.push({ ...project, semesterId });
              });
            }
          });
          
          setProjects(allProjects);
        }
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      semesterFilter === 'all' ||
      project.semesterId.toString() === semesterFilter;
    const isApprovedAndGraded = 
      project.status.toLowerCase() === 'approved' && 
      project.finalSubmission?.instructorGrade !== null && 
      project.finalSubmission?.instructorGrade !== undefined;
    return matchesSearch && matchesSemester && isApprovedAndGraded;
  });

  const stats = [
    {
      label: 'IoT Projects',
      value: filteredProjects.length.toString(),
      icon: Cpu,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Classes',
      value: new Set(filteredProjects.map((p) => p.classId)).size.toString(),
      icon: GraduationCap,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Live Demos',
      value: filteredProjects.filter((p) => p.simulations.length > 0).length.toString(),
      icon: Radio,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Connected Devices',
      value: filteredProjects.reduce((acc, p) => acc + p.simulations.length, 0).toString(),
      icon: Wifi,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const leaderboard = filteredProjects
    .filter((p) => p.finalSubmission?.instructorGrade)
    .sort((a, b) => {
      const gradeA = a.finalSubmission?.instructorGrade || 0;
      const gradeB = b.finalSubmission?.instructorGrade || 0;
      return gradeB - gradeA;
    })
    .slice(0, 3)
    .map((p, index) => ({
      rank: index + 1,
      project: p.title,
      score: p.finalSubmission?.instructorGrade || 0,
      instructor: p.instructorName,
      class: p.className,
    }));

  return (
    <div className="min-h-screen bg-white">      

      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Centralize, Evaluate, and
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600"> Showcase</span> IoT Projects
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A single platform for students to submit, instructors to assess, and classes to demo IoT in real time.
              Built for FPTU's academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <div 
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </div> */}
              <div 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all font-semibold text-lg"
              >
                Browse Projects
              </div>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why IoT Showroom?</h2>
            <p className="text-xl text-gray-600">Everything you need in one powerful platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Submissions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• No more scattered LMS links</li>
                <li>• Centralized file management</li>
                <li>• Version control built-in</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Evaluation</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Configurable rubrics</li>
                <li>• Transparent scoring</li>
                <li>• Detailed feedback system</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Demos</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• MQTT/WebSocket streaming</li>
                <li>• Live sensor data charts</li>
                <li>• Interactive device control</li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reusable Repository</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Archive exemplary projects</li>
                <li>• Learning resource library</li>
                <li>• Future cohort inspiration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Role</h2>
            <p className="text-xl text-gray-600">Tailored experiences for each user type</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <div
              onClick={() => setActiveRole('student')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeRole === 'student'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              Student
            </div>
            <div
              onClick={() => setActiveRole('instructor')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeRole === 'instructor'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Instructor
            </div>
            <div
              onClick={() => setActiveRole('admin')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-5 h-5" />
              Admin
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {activeRole === 'student' && (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">For Students</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Create, submit, and showcase your IoT innovations with ease.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Create Projects</strong>
                        <p className="text-gray-600">Upload photos, diagrams, videos, and code repositories</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Live Demos</strong>
                        <p className="text-gray-600">Set up MQTT streams and showcase real-time sensor data</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Track Progress</strong>
                        <p className="text-gray-600">View feedback, scores, and leaderboard rankings</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl p-8 h-64 flex items-center justify-center">
                    <GraduationCap className="w-32 h-32 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'instructor' && (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">For Instructors</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Manage classes, evaluate projects, and provide meaningful feedback.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Create Classes</strong>
                        <p className="text-gray-600">Set up courses with custom rubrics and milestones</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Review Submissions</strong>
                        <p className="text-gray-600">Grade projects using configurable scoring criteria</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Nominate Excellence</strong>
                        <p className="text-gray-600">Select outstanding projects for Hall of Fame</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-8 h-64 flex items-center justify-center">
                    <Users className="w-32 h-32 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'admin' && (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">For Administrators</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Oversee the entire platform with powerful management tools.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">User Management</strong>
                        <p className="text-gray-600">Control roles, permissions, and access levels</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Monitor Classes</strong>
                        <p className="text-gray-600">Track all courses and project submissions system-wide</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-gray-900">Generate Reports</strong>
                        <p className="text-gray-600">Export data and analytics for compliance and insights</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-8 h-64 flex items-center justify-center">
                    <Shield className="w-32 h-32 text-red-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="projects" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured & Recent Projects</h2>
            <p className="text-xl text-gray-600">Discover outstanding IoT innovations from our students</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester.semesterId} value={semester.semesterId}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading projects...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.projectId} project={project} />
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No projects match your filters. Try adjusting your search.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="demo" className="py-20 px-6 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
                  <Wifi className="w-4 h-4" />
                  Connect via MQTT/WebSocket
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">See Devices in Action</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Connect via MQTT or WebSocket to stream sensor data and control actuators during reviews.
                  Watch real-time charts and interact with IoT devices remotely.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Real-time sensor data visualization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Interactive charts and dashboards</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">Remote device control during presentations</span>
                  </li>
                </ul>
                <div className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Explore Live Demo
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 p-12 flex items-center justify-center">
                <div className="text-white text-center">
                  <BarChart3 className="w-32 h-32 mx-auto mb-6 opacity-90" />
                  <div className="text-lg font-medium">Live Data Streaming</div>
                  <div className="text-blue-100 text-sm mt-2">MQTT • WebSocket • Real-time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Top-Rated Projects</h2>
            <p className="text-xl text-gray-600">Celebrating excellence in IoT innovation</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Instructor</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((item) => (
                    <tr key={item.rank} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.rank === 1 && <span className="text-2xl">🥇</span>}
                          {item.rank === 2 && <span className="text-2xl">🥈</span>}
                          {item.rank === 3 && <span className="text-2xl">🥉</span>}
                          <span className="font-bold text-gray-900">#{item.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.project}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.class}</td>
                      <td className="px-6 py-4 text-gray-600">{item.instructor}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                          <TrendingUp className="w-4 h-4" />
                          {item.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create & Submit</h3>
              <p className="text-gray-600 text-lg">
                Students add project details, upload assets, and configure live demo connections.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Assess & Feedback</h3>
              <p className="text-gray-600 text-lg">
                Instructors use configurable rubrics to score projects and provide detailed feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Demo & Showcase</h3>
              <p className="text-gray-600 text-lg">
                Stream live data during presentations and archive the best projects for posterity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bring Clarity to Your IoT Course Projects
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of students and instructors already using IoT Showroom
          </p>
          <div 
            className="px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-bold text-xl shadow-xl flex items-center gap-3 mx-auto"
          >
            Create Your First Project <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </section>

    
    </div>
  );
};

export default Home;
