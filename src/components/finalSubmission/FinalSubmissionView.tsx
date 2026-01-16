import { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Table,
} from "antd";
import { FileText, Download, Calendar, Award, User } from "lucide-react";
import { getFinalSubmission } from "../../api/finalSubmission";
import { submitFinalGrade } from "../../api/instructor";
import type { FinalSubmission } from "../../types/finalSubmission";
import type { Id } from "../../types/base";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

interface FinalSubmissionViewProps {
  projectId: Id;
  role: "student" | "instructor";
}

export default function FinalSubmissionView({
  projectId,
  role,
}: FinalSubmissionViewProps) {
  const [submission, setSubmission] = useState<FinalSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [grading, setGrading] = useState(false);
  const [form] = Form.useForm();
  const [rubricScores, setRubricScores] = useState({
    repository: 0,
    sourceCode: 0,
    finalReport: 0,
    presentation: 0,
    videoDemo: 0,
  });

  const rubricCriteria = [
    {
      key: "repository",
      name: "Repository",
      maxScore: 100,
      weight: 0.2,
      description: "GitHub/GitLab repository quality",
    },
    {
      key: "sourceCode",
      name: "Source Code",
      maxScore: 100,
      weight: 0.25,
      description: "Code quality and documentation",
    },
    {
      key: "finalReport",
      name: "Final Report",
      maxScore: 100,
      weight: 0.25,
      description: "Technical documentation",
    },
    {
      key: "presentation",
      name: "Presentation",
      maxScore: 100,
      weight: 0.15,
      description: "Presentation slides quality",
    },
    {
      key: "videoDemo",
      name: "Video Demo",
      maxScore: 100,
      weight: 0.15,
      description: "Video demonstration",
    },
  ];

  const calculateFinalGrade = () => {
    const total = rubricCriteria.reduce((sum, criterion) => {
      const score = rubricScores[criterion.key as keyof typeof rubricScores];
      return sum + score * criterion.weight;
    }, 0);
    return total;
  };

  useEffect(() => {
    fetchSubmission();
  }, [projectId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const res = await getFinalSubmission(projectId);
      if (res.isSuccess && res.data) {
        setSubmission(res.data);
      } else {
        setSubmission(null);
      }
    } catch (e) {
      console.log("No final submission found");
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    if (!submission) return;

    try {
      const values = await form.validateFields();
      setGrading(true);

      const totalGrade = calculateFinalGrade();

      const res = await submitFinalGrade(projectId, {
        grade: totalGrade,
        feedback: values.feedback,
      });

      if (!res.isSuccess) {
        toast.error(res.message || "Failed to submit grade");
        return;
      }

      toast.success("Graded successfully");
      setGradeModalOpen(false);
      form.resetFields();
      setRubricScores({
        repository: 0,
        sourceCode: 0,
        finalReport: 0,
        presentation: 0,
        videoDemo: 0,
      });
      await fetchSubmission();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "blue";
      case "graded":
        return "green";
      case "late":
        return "orange";
      default:
        return "default";
    }
  };

  const downloadFile = (url: string | null) => {
    if (!url) {
      toast.error("File not available");
      return;
    }
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!submission) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No final submission yet"
        />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Final Submission</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag color={getStatusColor(submission.status)}>
                {submission.status?.toUpperCase()}
              </Tag>
              {role === "instructor" && !submission.grade && (
                <Button
                  type="primary"
                  size="small"
                  icon={<Award className="w-4 h-4" />}
                  onClick={() => {
                    form.setFieldsValue({
                      grade: submission.grade || undefined,
                      feedback: submission.feedback || "",
                    });
                    setGradeModalOpen(true);
                  }}
                >
                  Grade Submission
                </Button>
              )}
            </div>
          </div>
        }
      >
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Project">
            {submission.projectTitle}
          </Descriptions.Item>
          <Descriptions.Item label="Group">
            {submission.groupName}
          </Descriptions.Item>

          <Descriptions.Item label="Submitted By" span={2}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{submission.submittedByName}</span>
              <span className="text-gray-500 text-xs">
                on {dayjs(submission.submittedAt).format("MMM D, YYYY HH:mm")}
              </span>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Deadline">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {dayjs(submission.deadline).format("MMM D, YYYY HH:mm")}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Last Updated">
            {dayjs(submission.lastUpdatedAt).format("MMM D, YYYY HH:mm")}
          </Descriptions.Item>

          <Descriptions.Item label="Repository URL" span={2}>
            {submission.repositoryUrl ? (
              <a
                href={submission.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {submission.repositoryUrl}
              </a>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Notes" span={2}>
            {submission.submissionNotes || (
              <span className="text-gray-400">—</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6">
          <h4 className="font-medium mb-3">Submitted Files</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadFile(submission.finalReportUrl)}
              disabled={!submission.finalReportUrl}
              block
            >
              Final Report {!submission.finalReportUrl && "(Not uploaded)"}
            </Button>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadFile(submission.presentationUrl)}
              disabled={!submission.presentationUrl}
              block
            >
              Presentation {!submission.presentationUrl && "(Not uploaded)"}
            </Button>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadFile(submission.sourceCodeUrl)}
              disabled={!submission.sourceCodeUrl}
              block
            >
              Source Code {!submission.sourceCodeUrl && "(Not uploaded)"}
            </Button>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadFile(submission.videoDemoUrl)}
              disabled={!submission.videoDemoUrl}
              block
            >
              Video Demo {!submission.videoDemoUrl && "(Not uploaded)"}
            </Button>
          </div>
        </div>

        {submission.grade !== null && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Graded</span>
              </div>
              <Tag color="green" className="text-lg font-bold">
                {submission.grade}/100
              </Tag>
            </div>
            {submission.feedback && (
              <div className="mt-2">
                <div className="text-sm text-gray-600 mb-1">Feedback:</div>
                <div className="text-sm text-gray-800">
                  {submission.feedback}
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Graded by {submission.gradedByName} on{" "}
              {submission.gradedAt &&
                dayjs(submission.gradedAt).format("MMM D, YYYY HH:mm")}
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={gradeModalOpen}
        title={
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold">
              Grade Final Submission - Rubric Based
            </span>
          </div>
        }
        style={{ top: 20 }}
        onCancel={() => {
          setGradeModalOpen(false);
          setRubricScores({
            repository: 0,
            sourceCode: 0,
            finalReport: 0,
            presentation: 0,
            videoDemo: 0,
          });
        }}
        onOk={handleGradeSubmit}
        confirmLoading={grading}
        width={900}
        okText="Submit Grade"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-700">
              Evaluation Rubric
            </h4>
            <Table
              dataSource={rubricCriteria}
              rowKey="key"
              pagination={false}
              bordered
              size="middle"
              columns={[
                {
                  title: "Criterion",
                  dataIndex: "name",
                  key: "name",
                  width: 150,
                  render: (text) => <span className="font-medium">{text}</span>,
                },
                {
                  title: "Description",
                  dataIndex: "description",
                  key: "description",
                  ellipsis: true,
                },
                {
                  title: "Weight",
                  dataIndex: "weight",
                  key: "weight",
                  width: 100,
                  align: "center",
                  render: (weight) => (
                    <Tag color="blue">{(weight * 100).toFixed(0)}%</Tag>
                  ),
                },
                {
                  title: "Max Score",
                  dataIndex: "maxScore",
                  key: "maxScore",
                  width: 100,
                  align: "center",
                  render: (score) => (
                    <span className="font-semibold">{score}</span>
                  ),
                },
                {
                  title: "Score",
                  key: "score",
                  width: 150,
                  align: "center",
                  render: (_, record) => (
                    <InputNumber
                      min={0}
                      max={record.maxScore}
                      precision={1}
                      value={
                        rubricScores[record.key as keyof typeof rubricScores]
                      }
                      onChange={(value) => {
                        setRubricScores((prev) => ({
                          ...prev,
                          [record.key]: value || 0,
                        }));
                      }}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  ),
                },
              ]}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                Calculated Final Grade:
              </span>
              <Tag color="purple" className="text-xl font-bold px-4 py-1">
                {calculateFinalGrade().toFixed(2)}/100
              </Tag>
            </div>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              name="feedback"
              label="Overall Feedback"
              rules={[{ required: true, message: "Please provide feedback" }]}
            >
              <Input.TextArea
                rows={5}
                placeholder="Provide detailed feedback for the final submission..."
              />
            </Form.Item>
          </Form>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Note:</span> The final grade is
              automatically calculated based on weighted scores. Each criterion
              contributes according to its weight percentage.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
