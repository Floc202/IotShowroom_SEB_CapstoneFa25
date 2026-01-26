import { Modal, Button, Divider, Table, Empty, Card, Descriptions, Tag, Tooltip } from "antd";
import { Award } from "lucide-react";
import { formatVietnamTime } from "../../utils/helpers";
import dayjs from "dayjs";

interface MilestoneGrade {
  meId: number;
  milestoneTitle: string;
  instructorName: string;
  score: number;
  weightRatioSnapshot: number;
  feedback: string;
  evaluatedAt: string;
}

interface FinalSubmission {
  status: string;
  submittedAt: string;
  grade: number | null;
  repositoryUrl: string | null;
}

interface Grader {
  graderId: number;
  graderName: string;
  graderEmail: string;
  status: string;
  grade: number | null;
  gradedAt: string | null;
  feedback: string | null;
}

interface GradersInfo {
  totalGradersAssigned: number;
  gradersCompleted: number;
  averageGrade: number | null;
  graders: Grader[];
}

interface AllGradesOverviewProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  milestoneGrades: MilestoneGrade[];
  finalSubmission: FinalSubmission | null;
  gradersInfo: GradersInfo | null;
}

export default function AllGradesOverview({
  open,
  onClose,
  loading,
  milestoneGrades,
  finalSubmission,
  gradersInfo,
}: AllGradesOverviewProps) {
  const hasFinalGrade = finalSubmission && finalSubmission.grade !== null;
  const hasAllAdditionalGrades = gradersInfo && 
    gradersInfo.totalGradersAssigned > 0 && 
    gradersInfo.gradersCompleted === gradersInfo.totalGradersAssigned;
  
  const showBothGrades = hasFinalGrade && hasAllAdditionalGrades;

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">All Grades Overview</span>
        </div>
      }
      style={{ top: 10 }}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={1000}
      loading={loading}
    >
      <div className="space-y-6">
        <div>
          <Divider
            orientation="left"
            className="text-lg font-semibold text-purple-700"
          >
            Milestone Grades (Grades & Performance)
          </Divider>
          {milestoneGrades.length > 0 ? (
            <Table
              dataSource={milestoneGrades}
              rowKey="meId"
              pagination={false}
              size="middle"
              bordered
              columns={[
                {
                  title: "Milestone",
                  dataIndex: "milestoneTitle",
                  key: "milestoneTitle",
                  width: 200,
                  render: (text) => (
                    <span className="font-medium">{text}</span>
                  ),
                },
                {
                  title: "Instructor",
                  dataIndex: "instructorName",
                  key: "instructorName",
                  width: 150,
                },
                {
                  title: "Score",
                  dataIndex: "score",
                  key: "score",
                  width: 100,
                  align: "center",
                  render: (score) => (
                    <Tag
                      color={
                        score >= 70 ? "green" : score >= 50 ? "orange" : "red"
                      }
                    >
                      <span className="font-bold text-base">{score}/100</span>
                    </Tag>
                  ),
                },
                {
                  title: "Weight",
                  dataIndex: "weightRatioSnapshot",
                  key: "weightRatioSnapshot",
                  width: 100,
                  align: "center",
                  render: (weight) => <span>{weight}%</span>,
                },
                {
                  title: "Feedback",
                  dataIndex: "feedback",
                  key: "feedback",
                  ellipsis: true,
                  render: (text) => (
                    <Tooltip title={text}>
                      <span className="text-gray-600">{text || "—"}</span>
                    </Tooltip>
                  ),
                },
                {
                  title: "Evaluated At",
                  dataIndex: "evaluatedAt",
                  key: "evaluatedAt",
                  width: 150,
                  render: (date) => formatVietnamTime(date),
                },
              ]}
            />
          ) : (
            <Empty description="No milestone grades yet" />
          )}
        </div>

        {!showBothGrades && (
          <div>
            <Divider
              orientation="left"
              className="text-lg font-semibold text-blue-700"
            >
              Final Submission & Additional Evaluations
            </Divider>
            <Card size="small" className="bg-blue-50">
              <Empty
                description={
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium text-base">
                      Waiting for instructors to grade
                    </p>
                    <p className="text-gray-600 text-sm">
                      Your grades will be available once all instructors have completed their evaluations.
                    </p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          </div>
        )}

        {showBothGrades && (
          <>
            <div>
              <Divider
                orientation="left"
                className="text-lg font-semibold text-indigo-700"
              >
                Final Submission Grade (Graded by Main Instructor)
              </Divider>
              <Card
                size="small"
                className="shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50"
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Status" span={1}>
                    <Tag
                      color={
                        finalSubmission!.status === "Submitted"
                          ? "green"
                          : "blue"
                      }
                    >
                      {finalSubmission!.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Submitted At" span={1}>
                    {formatVietnamTime(finalSubmission!.submittedAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grade" span={2}>
                    <Tag
                      color="purple"
                      className="text-lg font-bold px-4 py-1"
                    >
                      {finalSubmission!.grade!.toFixed(2)}/100
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Repository" span={2}>
                    {finalSubmission!.repositoryUrl ? (
                      <a
                        href={finalSubmission!.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {finalSubmission!.repositoryUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>

            <div>
              <Divider
                orientation="left"
                className="text-lg font-semibold text-amber-700"
              >
                Additional Instructor Evaluations
              </Divider>
              <Card size="small" className="bg-amber-50">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {gradersInfo!.totalGradersAssigned}
                      </div>
                      <div className="text-xs text-gray-600">Total Graders</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {gradersInfo!.gradersCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {gradersInfo!.averageGrade!.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Average Grade</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-orange-600">
                        {gradersInfo!.totalGradersAssigned - gradersInfo!.gradersCompleted}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Assigned Instructors</h4>
                      <Table
                        dataSource={gradersInfo!.graders}
                        rowKey="graderId"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Instructor Name",
                            key: "grader",
                            render: (_: any, record: Grader) => (
                              <div>
                                <div className="font-medium">{record.graderName}</div>
                                <div className="text-xs text-gray-500">{record.graderEmail}</div>
                              </div>
                            ),
                          },
                          {
                            title: "Status",
                            dataIndex: "status",
                            key: "status",
                            width: 120,
                            align: "center",
                            render: (status: string) => {
                              const colorMap: Record<string, string> = {
                                Completed: "green",
                                Pending: "orange",
                                NotStarted: "default",
                              };
                              return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
                            },
                          },
                        ]}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-gray-700">Individual Grades</h4>
                      <Table
                        dataSource={gradersInfo!.graders
                          .filter(g => g.grade !== null)
                          .map((g, idx) => ({ 
                            key: idx, 
                            grade: g.grade,
                            gradedAt: g.gradedAt,
                            feedback: g.feedback
                          }))}
                        rowKey="key"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Grade",
                            key: "grade",
                            width: 100,
                            render: (_: any, __: any, index: number) => (
                              <span className="font-medium">Grade {index + 1}</span>
                            ),
                          },
                          {
                            title: "Score",
                            dataIndex: "grade",
                            key: "score",
                            width: 80,
                            align: "center",
                            render: (grade: number) => (
                              <span className="font-semibold text-blue-600 text-base">
                                {grade.toFixed(2)}
                              </span>
                            ),
                          },
                          {
                            title: "Graded At",
                            dataIndex: "gradedAt",
                            key: "gradedAt",
                            width: 150,
                            render: (date: string | null) =>
                              date ? formatVietnamTime(date) : "—",
                          },
                          {
                            title: "Feedback",
                            dataIndex: "feedback",
                            key: "feedback",
                            ellipsis: true,
                            render: (feedback: string | null) => (
                              <Tooltip title={feedback}>
                                <span className="text-gray-600">{feedback || "—"}</span>
                              </Tooltip>
                            ),
                          },
                        ]}
                      />
                      {gradersInfo!.graders.filter(g => g.grade !== null).length === 0 && (
                        <Empty description="No grades yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
