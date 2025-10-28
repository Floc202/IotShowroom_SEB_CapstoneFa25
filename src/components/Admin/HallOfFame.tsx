import React, { useState } from 'react';
import { Trophy, Award, Star, Calendar, Users, ExternalLink } from 'lucide-react';

const HallOfFame: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState('FA25');

  const semesters = ['SP25', 'SU25', 'FA25'];

  const topProjects = [
    {
      id: '1',
      rank: 1,
      title: 'Smart Home IoT System',
      groupName: 'Nhóm Smart Home',
      className: 'Cơ sở IoT',
      instructor: 'TS. Trần Thị Hương',
      score: 98.5,
      semester: 'FA25',
      members: ['Lê Minh Student', 'Hoàng Thu Hà', 'Vũ Đức Anh'],
      highlights: [
        'Outstanding MQTT implementation',
        'Excellent UI/UX design',
        'Comprehensive documentation',
        'Live demo performance'
      ],
      technologies: ['Arduino', 'MQTT', 'Node.js', 'React', 'MongoDB'],
    },
    {
      id: '2',
      rank: 2,
      title: 'AI-Powered Weather Station',
      groupName: 'Weather Masters',
      className: 'Mạng cảm biến',
      instructor: 'TS. Phạm Văn Khoa',
      score: 96.8,
      semester: 'FA25',
      members: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'],
      highlights: [
        'Machine learning integration',
        'Real-time data processing',
        'Scalable architecture'
      ],
      technologies: ['ESP32', 'Python', 'TensorFlow', 'WebSocket'],
    },
    {
      id: '3',
      rank: 3,
      title: 'Industrial Monitoring System',
      groupName: 'Industry 4.0',
      className: 'Ứng dụng IoT',
      instructor: 'TS. Trần Thị Hương',
      score: 95.2,
      semester: 'FA25',
      members: ['Phạm Thị D', 'Hoàng Văn E'],
      highlights: [
        'Professional grade solution',
        'Advanced security features',
        'Cloud integration'
      ],
      technologies: ['Raspberry Pi', 'Azure IoT', 'Docker', 'Grafana'],
    },
    {
      id: '4',
      rank: 4,
      title: 'Smart Agriculture Solution',
      groupName: 'AgriTech',
      className: 'Cơ sở IoT',
      instructor: 'TS. Trần Thị Hương',
      score: 94.5,
      semester: 'FA25',
      members: ['Đặng Văn F', 'Vũ Thị G', 'Nguyễn Văn H', 'Trần Thị I'],
      highlights: [
        'Practical application',
        'Cost-effective design',
        'Environmental impact'
      ],
      technologies: ['Arduino', 'LoRa', 'Firebase', 'Flutter'],
    },
    {
      id: '5',
      rank: 5,
      title: 'Smart Traffic Management',
      groupName: 'Traffic Control',
      className: 'Ứng dụng IoT',
      instructor: 'TS. Trần Thị Hương',
      score: 93.8,
      semester: 'FA25',
      members: ['Lê Thị J', 'Phạm Văn K', 'Hoàng Thị L'],
      highlights: [
        'Computer vision integration',
        'Real-time analytics',
        'Innovative approach'
      ],
      technologies: ['OpenCV', 'YOLO', 'Node-RED', 'InfluxDB'],
    },
  ];

  const hallOfFameHistory = [
    {
      semester: 'SP25',
      title: 'IoT Healthcare Monitoring',
      score: 97.2,
      group: 'HealthTech Heroes',
    },
    {
      semester: 'SU25',
      title: 'Smart Parking System',
      score: 96.5,
      group: 'ParkMasters',
    },
    {
      semester: 'FA25',
      title: 'Smart Home IoT System',
      score: 98.5,
      group: 'Nhóm Smart Home',
    },
  ];

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hall of Fame</h1>
            <p className="text-gray-600">Top performing projects and outstanding achievements</p>
          </div>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Select Semester:</span>
          <div className="flex gap-2">
            {semesters.map(sem => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedSemester === sem
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border-2 border-blue-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🏆 Top 3 Projects - {selectedSemester}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProjects.slice(0, 3).map(project => (
            <div
              key={project.id}
              className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transform transition-all hover:scale-105 ${
                project.rank === 1 ? 'border-yellow-400 md:order-2 md:scale-110' :
                project.rank === 2 ? 'border-gray-400 md:order-1' :
                'border-orange-400 md:order-3'
              }`}
            >
              <div className={`p-4 bg-gradient-to-r ${getMedalColor(project.rank)} text-center`}>
                <div className="text-4xl mb-2">{getMedalIcon(project.rank)}</div>
                <p className="text-white font-bold text-lg">Rank #{project.rank}</p>
                <p className="text-white text-2xl font-bold">{project.score}%</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-1">Group: {project.groupName}</p>
                <p className="text-sm text-gray-600 mb-3">Class: {project.className}</p>
                
                <div className="space-y-2 mb-4">
                  {project.highlights.slice(0, 2).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Top 10 Leaderboard - {selectedSemester}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  index < 3 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(project.rank)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {project.rank}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          {project.groupName} • {project.className}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{project.score}%</div>
                        <p className="text-xs text-gray-500">Final Score</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.members.length} members
                      </span>
                      <span>Instructor: {project.instructor}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.highlights.map((highlight, idx) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                          ✓ {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <button className="flex items-center gap-1 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hall of Fame History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Hall of Fame History
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {hallOfFameHistory.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                      {item.semester}
                    </span>
                    <span className="text-2xl font-bold text-yellow-600">{item.score}%</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.group}</p>
                </div>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                  View Project
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
