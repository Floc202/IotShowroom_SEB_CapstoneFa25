import { useState, useEffect } from "react";
import { Card, Select, Table, Tag, Empty, Spin, Typography, Row, Col, Statistic, Modal, Descriptions, Button, Tabs } from "antd";
import { Trophy, Medal, Award, Star, Eye, ExternalLink, FileText, Video, Presentation } from "lucide-react";
import { getLeaderboardTop10 } from "../../api/admin";
import { listSemesters } from "../../api/semesters";
import type { LeaderboardTop10 } from "../../types/admin";
import type { Semester } from "../../types/semesters";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

type ProjectDetails = LeaderboardTop10['topProjects'][0];

export default function HallOfFame() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<LeaderboardTop10 | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchHallOfFameData();
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const res = await listSemesters();
      if (res.isSuccess && res.data) {
        setSemesters(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchHallOfFameData = async () => {
    try {
      setLoading(true);
      if (selectedSemester) {
        const leaderRes = await getLeaderboardTop10(selectedSemester);
        if (leaderRes.isSuccess && leaderRes.data) {
          setLeaderboard(leaderRes.data);
        } else {
          setLeaderboard(null);
        }
      } else {
        setLeaderboard(null);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const showProjectDetails = (project: ProjectDetails) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <Star className="w-5 h-5 text-blue-500" />;
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center justify-center gap-2">
          {getRankBadge(rank)}
          <span className="font-bold text-lg">#{rank}</span>
        </div>
      ),
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (text: string | null) => <span className="font-semibold">{text || "N/A"}</span>,
    },
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text: string | null) => text || "N/A",
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
      render: (text: string | null) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Main Instructor Score",
      dataIndex: "finalScore",
      key: "finalScore",
      width: 200,
      render: (score: number | null) => (
        <Tag color={score && score >= 90 ? "green" : score && score >= 80 ? "blue" : "orange"} className="font-bold">
          {score?.toFixed(2) || "N/A"}
        </Tag>
      ),
      sorter: (a: ProjectDetails, b: ProjectDetails) => (b.finalScore || 0) - (a.finalScore || 0),
    },
    {
      title: "Completed",
      dataIndex: "completedDate",
      key: "completedDate",
      width: 150,
      render: (date: string | null) => {
        if (!date) return <span className="text-gray-400">-</span>;
        const vnDate = dayjs.utc(date).add(7, 'hour');
        return <span>{vnDate.format("DD/MM/YYYY HH:mm")}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: any, record: ProjectDetails) => (
        <Button
          type="primary"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => showProjectDetails(record)}
          size="small"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>
          <Trophy className="w-8 h-8 inline-block mr-2 text-yellow-500" />
          Hall of Fame
        </Title>
        <Select
          placeholder="Select Semester"
          style={{ width: 300 }}
          value={selectedSemester}
          onChange={setSelectedSemester}
          allowClear
          options={semesters.map((s) => ({
            label: `${s.name} (${s.year} - ${s.term})`,
            value: s.semesterId,
          }))}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {leaderboard && (
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Semester"
                    value={leaderboard.semesterName}
                    prefix={<Star className="w-5 h-5" />}
                    valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Top 1 Rank"
                    value={leaderboard.topProjects[0]?.projectName || "N/A"}
                    prefix={<Trophy className="w-5 h-5" />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Projects"
                    value={leaderboard.totalProjects}
                    prefix={<Award className="w-5 h-5" />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card>
            {leaderboard && leaderboard.topProjects.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Generated at: {dayjs.utc(leaderboard.generatedAt).add(7, 'hour').format("DD/MM/YYYY HH:mm:ss")} 
                </div>
                <Table
                  dataSource={leaderboard.topProjects}
                  columns={columns}
                  rowKey={(record) => `${record.projectId}-${record.rank}`}
                  pagination={{ pageSize: 20 }}
                />
              </>
            ) : (
              <Empty description="No leaderboard data available. Please select a semester." />
            )}
          </Card>
        </>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Project Details - Rank #{selectedProject?.rank}</span>
          </div>
        }
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        {selectedProject && (
          <Tabs
            items={[
              {
                key: "overview",
                label: "Overview",
                children: (
                  <div className="space-y-4">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Project Name">
                        <span className="font-semibold">{selectedProject.projectName}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Group Name">
                        {selectedProject.groupName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Description">
                        <div className="whitespace-pre-wrap">{selectedProject.projectDescription}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Components">
                        <div className="whitespace-pre-wrap">{selectedProject.projectComponent}</div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Main Instructor Score">
                        <Tag color={selectedProject.finalScore >= 90 ? "green" : selectedProject.finalScore >= 80 ? "blue" : "orange"} className="font-bold text-lg">
                          {selectedProject.finalScore.toFixed(2)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Completed Date">
                        {dayjs.utc(selectedProject.completedDate).add(7, 'hour').format("DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Simulator Link">
                        {selectedProject.simulatorLink ? (
                          <a href={selectedProject.simulatorLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            Open Simulator
                          </a>
                        ) : (
                          <span className="text-gray-400">Not available</span>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ),
              },
              {
                key: "milestones",
                label: "Milestones",
                children: (
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone) => (
                      <Card key={milestone.milestoneId} size="small">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold">{milestone.milestoneName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Weight: <Tag color="blue">{milestone.weight.toFixed(2)}%</Tag>
                              Score: <Tag color="green">{milestone.score.toFixed(2)}</Tag>
                              Weighted Score: <Tag color="purple">{milestone.weightedScore.toFixed(2)}</Tag>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ),
              },
              {
                key: "submission",
                label: "Final Submission",
                children: (
                  <div className="space-y-4">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Average Grade">
                        <Tag color="green" className="font-bold text-lg">
                          {selectedProject.finalSubmission.averageGrade.toFixed(2)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Submitted At">
                        {dayjs.utc(selectedProject.finalSubmission.submittedAt).add(7, 'hour').format("DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Submission Notes">
                        <div className="whitespace-pre-wrap">{selectedProject.finalSubmission.submissionNotes}</div>
                      </Descriptions.Item>
                    </Descriptions>

                    <div>
                      <h4 className="font-semibold mb-3">Deliverables</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Final Report</span>
                          </div>
                          {selectedProject.finalSubmission.finalReportUrl ? (
                            <a href={selectedProject.finalSubmission.finalReportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View File
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Presentation className="w-4 h-4" />
                            <span className="font-medium">Presentation</span>
                          </div>
                          {selectedProject.finalSubmission.presentationUrl ? (
                            <a href={selectedProject.finalSubmission.presentationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View File
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <span className="font-medium">Demo Video</span>
                          </div>
                          {selectedProject.finalSubmission.demoVideoUrl ? (
                            <a href={selectedProject.finalSubmission.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View File
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Grader Feedback</h4>
                      {selectedProject.finalSubmission.graderGrades.length > 0 ? (
                        <div className="space-y-3">
                          {selectedProject.finalSubmission.graderGrades.map((grader) => (
                            <Card key={grader.graderId} size="small">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-semibold">{grader.graderName}</div>
                                    <div className="text-sm text-gray-500">{grader.graderEmail}</div>
                                  </div>
                                  <Tag color="blue" className="font-bold">{grader.grade.toFixed(2)}</Tag>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Feedback:</span> {grader.feedback}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Graded at: {dayjs.utc(grader.gradedAt).add(7, 'hour').format("DD/MM/YYYY HH:mm")}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Empty description="No grader feedback yet" />
                      )}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
