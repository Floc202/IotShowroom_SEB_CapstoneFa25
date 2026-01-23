import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Spin,
  Tag,
  Breadcrumb,
  Collapse,
  Tooltip,
} from "antd";
import { ArrowLeft, FileText, Cpu, Award } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getFinalSubmissionDetail, submitGrade } from "../../api/grading";
import { getSimulationsByProject } from "../../api/simulation";
import type {
  FinalSubmissionDetail,
  SubmitGradeRequest,
} from "../../types/grading";
import type { SimulationItem } from "../../api/simulation";
import { WokwiSimulator } from "../../components/liveDemo/WokwiSimulator";
import { getErrorMessage } from "../../utils/helpers";

const { Panel } = Collapse;

export default function InstructorGradingSubmissionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const finalSubmissionId = searchParams.get("finalSubmissionId");

  const [loading, setLoading] = useState(false);
  const [submissionDetail, setSubmissionDetail] =
    useState<FinalSubmissionDetail | null>(null);
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const [rubricScores, setRubricScores] = useState({
    repository: 0,
    sourceCode: 0,
    finalReport: 0,
    presentation: 0,
    videoDemo: 0,
  });

  const rubricCriteria = [
    { key: 'repository', name: 'Repository', maxScore: 100, weight: 0.2, description: 'GitHub/GitLab repository quality' },
    { key: 'sourceCode', name: 'Source Code', maxScore: 100, weight: 0.25, description: 'Code quality and documentation' },
    { key: 'finalReport', name: 'Final Report', maxScore: 100, weight: 0.25, description: 'Technical documentation' },
    { key: 'presentation', name: 'Presentation', maxScore: 100, weight: 0.15, description: 'Presentation slides quality' },
    { key: 'videoDemo', name: 'Video Demo', maxScore: 100, weight: 0.15, description: 'Video demonstration' },
  ];

  const calculateFinalGrade = () => {
    const total = rubricCriteria.reduce((sum, criterion) => {
      const score = rubricScores[criterion.key as keyof typeof rubricScores];
      return sum + score * criterion.weight;
    }, 0);
    return total;
  };

  const isAllDocumentsSubmitted = () => {
    if (!submissionDetail) return false;
    return !!(
      submissionDetail.repositoryUrl &&
      submissionDetail.sourceCodeUrl &&
      submissionDetail.finalReportUrl &&
      submissionDetail.presentationUrl &&
      submissionDetail.videoDemoUrl
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (finalSubmissionId) {
      fetchSubmissionDetail();
    }
  }, [finalSubmissionId]);

  const fetchSubmissionDetail = async () => {
    if (!finalSubmissionId) return;

    try {
      setLoading(true);
      const res = await getFinalSubmissionDetail(Number(finalSubmissionId));
      setSubmissionDetail(res.data);

      if (res.data.projectId) {
        try {
          const simRes = await getSimulationsByProject(res.data.projectId);
          if (simRes.data.isSuccess && simRes.data.data) {
            setSimulations(
              simRes.data.data.filter((sim) => sim.status === "submitted")
            );
          }
        } catch (e) {
          console.error("Failed to fetch simulations:", e);
          setSimulations([]);
        }
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = () => {
    if (!isAllDocumentsSubmitted()) {
      toast.error("Cannot submit grade. Student has not submitted all required documents.");
      return;
    }
    setGradeModalVisible(true);
    form.resetFields();
    setRubricScores({
      repository: 0,
      sourceCode: 0,
      finalReport: 0,
      presentation: 0,
      videoDemo: 0,
    });
  };

  const handleSubmitGrade = async (values: SubmitGradeRequest) => {
    if (!submissionDetail || !finalSubmissionId) return;

    try {
      setSubmitLoading(true);
      await submitGrade(Number(finalSubmissionId), values);
      toast.success("Grade submitted successfully");
      setGradeModalVisible(false);
      fetchSubmissionDetail();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!submissionDetail) {
    return null;
  }

  return (
    <div className="p-8">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>Instructor</Breadcrumb.Item>
        <Breadcrumb.Item>Grading</Breadcrumb.Item>
        <Breadcrumb.Item>Submission Detail</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-0-important">
              Grading Rubric
            </h1>
            <p className="text-gray-500 mt-1">
              {submissionDetail.projectTitle} - {submissionDetail.groupName}
            </p>
          </div>
        </div>
        {submissionDetail.hasMyGrade && (
          <Tooltip
            title={!isAllDocumentsSubmitted() ? "Student has not submitted all required documents" : ""}
          >
            <Button
              type="primary"
              size="large"
              onClick={handleGrade}
              disabled={!isAllDocumentsSubmitted()}
            >
              Submit Grade
            </Button>
          </Tooltip>
        )}
      </div>

      <Card size="small" className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-600">Submitted:</span>{" "}
            <strong>
              {dayjs(submissionDetail.submittedAt).format("DD/MM/YYYY HH:mm")}
            </strong>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>{" "}
            {submissionDetail.hasMyGrade ? (
              <Tag color="success">Graded</Tag>
            ) : (
              <Tag color="warning">Pending</Tag>
            )}
          </div>
          {/* {submissionDetail.averageGrade !== null && (
            <div>
              <span className="text-gray-600">Average Score:</span>{" "}
              <Tag color="blue" style={{ fontSize: 16, padding: "4px 12px" }}>
                {submissionDetail.averageGrade}/100
              </Tag>
            </div>
          )} */}
        </div>
      </Card>

      <Card title="Evaluation Rubric" className="mb-4">
        <Table
          dataSource={[
            {
              key: "1",
              criteria: "Repository",
              description: "GitHub/GitLab repository with complete source code",
              weight: "20%",
              file: submissionDetail.repositoryUrl,
            },
            {
              key: "2",
              criteria: "Source Code",
              description: "Clean, well-documented, and functional code",
              weight: "25%",
              file: submissionDetail.sourceCodeUrl,
            },
            {
              key: "3",
              criteria: "Final Report",
              description: "Comprehensive documentation and technical report",
              weight: "25%",
              file: submissionDetail.finalReportUrl,
            },
            {
              key: "4",
              criteria: "Presentation",
              description: "Clear and professional project presentation slides",
              weight: "15%",
              file: submissionDetail.presentationUrl,
            },
            {
              key: "5",
              criteria: "Video Demo",
              description: "Working demonstration of the IoT system",
              weight: "15%",
              file: submissionDetail.videoDemoUrl,
            },
          ]}
          pagination={false}
          bordered
          size="small"
          columns={[
            {
              title: "Evaluation Criteria",
              dataIndex: "criteria",
              key: "criteria",
              width: "20%",
              render: (text: string) => (
                <strong className="text-blue-600">{text}</strong>
              ),
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              width: "35%",
            },
            {
              title: "Weight",
              dataIndex: "weight",
              key: "weight",
              width: "10%",
              align: "center",
              render: (text: string) => <Tag color="purple">{text}</Tag>,
            },
            {
              title: "Submission",
              dataIndex: "file",
              key: "file",
              width: "35%",
              render: (file: string | null) =>
                file ? (
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FileText size={14} />
                    View File
                  </a>
                ) : (
                  <span className="text-gray-400">Not submitted</span>
                ),
            },
          ]}
        />
      </Card>

      {simulations.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-purple-600" />
              <span>IoT Simulations (Submitted)</span>
            </div>
          }
          className="mb-4"
        >
          <Collapse accordion>
            {simulations.map((sim) => (
              <Panel
                header={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong>{sim.title}</strong>
                      <Tag color="blue">SUBMITTED</Tag>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(
                        new Date(sim.createdAt).getTime() + 7 * 60 * 60 * 1000
                      ).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>
                }
                key={sim.simulationId}
              >
                <p className="text-gray-600 mb-4">{sim.description}</p>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <WokwiSimulator
                    projectId={sim.wokwiProjectId}
                    editable={false}
                    height={600}
                  />
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}

      <Card title="Instructor Evaluations">
        {submissionDetail.allGrades && submissionDetail.allGrades.length > 0 ? (
          <Table
            dataSource={submissionDetail.allGrades}
            rowKey="instructorId"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Instructor",
                dataIndex: "instructorName",
                key: "instructorName",
                width: "25%",
              },
              {
                title: "Score",
                dataIndex: "grade",
                key: "grade",
                align: "center",
                width: "15%",
                render: (grade: number) => (
                  <Tag
                    color="blue"
                    style={{ fontSize: 16, padding: "4px 12px" }}
                  >
                    {grade}/100
                  </Tag>
                ),
              },
              {
                title: "Evaluated At",
                dataIndex: "gradedAt",
                key: "gradedAt",
                width: "20%",
                render: (date: string) =>
                  dayjs(date).format("DD/MM/YYYY HH:mm"),
              },
              {
                title: "Feedback",
                dataIndex: "feedback",
                key: "feedback",
                render: (feedback: string) =>
                  feedback || (
                    <span className="text-gray-400">No feedback provided</span>
                  ),
              },
            ]}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            No evaluations yet
          </div>
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-semibold">Submit Grade - Rubric Based Evaluation</span>
          </div>
        }
        open={gradeModalVisible}
        onCancel={() => {
          setGradeModalVisible(false);
          setRubricScores({
            repository: 0,
            sourceCode: 0,
            finalReport: 0,
            presentation: 0,
            videoDemo: 0,
          });
        }}
        onOk={() => {
          form.validateFields().then((values) => {
            const totalGrade = calculateFinalGrade();
            handleSubmitGrade({
              grade: Math.round(totalGrade * 100) / 100,
              feedback: values.feedback || "",
            });
          });
        }}
        confirmLoading={submitLoading}
        width={900}
        okText="Submit Grade"
        style={{ top: 10 }}
      >
        <div className="space-y-6">
          

          <div>
            <h4 className="font-semibold mb-3 text-gray-700">Evaluation Rubric</h4>
            <Table
              dataSource={rubricCriteria}
              rowKey="key"
              pagination={false}
              bordered
              size="middle"
              columns={[
                {
                  title: 'Criterion',
                  dataIndex: 'name',
                  key: 'name',
                  width: 150,
                  render: (text) => <span className="font-medium">{text}</span>,
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                  ellipsis: true,
                },
                {
                  title: 'Weight',
                  dataIndex: 'weight',
                  key: 'weight',
                  width: 100,
                  align: 'center',
                  render: (weight) => <Tag color="blue">{(weight * 100).toFixed(0)}%</Tag>,
                },
                {
                  title: 'Max Score',
                  dataIndex: 'maxScore',
                  key: 'maxScore',
                  width: 100,
                  align: 'center',
                  render: (score) => <span className="font-semibold">{score}</span>,
                },
                {
                  title: 'Score',
                  key: 'score',
                  width: 150,
                  align: 'center',
                  render: (_, record) => (
                    <InputNumber
                      min={0}
                      max={record.maxScore}
                      precision={1}
                      value={rubricScores[record.key as keyof typeof rubricScores]}
                      onChange={(value) => {
                        setRubricScores((prev) => ({
                          ...prev,
                          [record.key]: value || 0,
                        }));
                      }}
                      placeholder="0"
                      style={{ width: '100%' }}
                    />
                  ),
                },
                // {
                //   title: 'Weighted Score',
                //   key: 'weighted',
                //   width: 120,
                //   align: 'center',
                //   render: (_, record) => {
                //     const score = rubricScores[record.key as keyof typeof rubricScores];
                //     const weighted = score * record.weight;
                //     return (
                //       <Tag color={weighted > 0 ? 'green' : 'default'}>
                //         {weighted.toFixed(2)}
                //       </Tag>
                //     );
                //   },
                // },
              ]}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Calculated Final Grade:</span>
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

         
        </div>
      </Modal>
    </div>
  );
}
