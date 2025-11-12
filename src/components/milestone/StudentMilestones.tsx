import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Descriptions,
  Dropdown,
  type MenuProps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FileText,
  Eye,
  MoreHorizontal,
  UploadCloud,
} from "lucide-react";
import { getMilestones } from "../../api/milestone";
import {
  submitMilestone,
  getSubmissionHistory,
  uploadSubmissionFile,
  getSubmissionFiles,
} from "../../api/submission";
import type { Milestone } from "../../types/milestone";
import type {
  Submission,
  CreateSubmissionRequest,
  SubmissionFile,
  SubmissionHistory,
} from "../../types/submission";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

interface StudentMilestonesProps {
  projectId: number;
  isLeader: boolean;
}

export default function StudentMilestones({
  projectId,
  isLeader,
}: StudentMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory | null>(null);
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const [submitForm] = Form.useForm<
    Omit<CreateSubmissionRequest, "projectId" | "milestoneId">
  >();

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await getMilestones(projectId);
      if (res.isSuccess && res.data) {
        setMilestones(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!selectedMilestone) return;
    try {
      const values = await submitForm.validateFields();
      setActionLoading(true);

      const payload: CreateSubmissionRequest = {
        projectId,
        milestoneId: selectedMilestone.milestoneId,
        description: values.description?.trim() || "",
        submissionNotes: values.submissionNotes?.trim() || "",
      };

      const res = await submitMilestone(payload);

      if (!res.isSuccess || !res.data) {
        toast.error(res.message || "Submit failed");
        return;
      }

      if (fileList.length > 0) {
        const submissionId = res.data.submissionId;
        console.log("submissionId: ", res)
        const uploadPromises = fileList.map((fileItem) =>
          uploadSubmissionFile(submissionId, fileItem.originFileObj)
        );

        const uploadResults = await Promise.allSettled(uploadPromises);
        const failedUploads = uploadResults.filter(
          (r) => r.status === "rejected"
        );

        if (failedUploads.length > 0) {
          toast.error(
            `Submitted successfully but ${failedUploads.length} file(s) failed to upload`
          );
        } else {
          toast.success(
            `Milestone submitted successfully with ${fileList.length} file(s)`
          );
        }
      } else {
        toast.success("Milestone submitted successfully");
      }

      setSubmitModalOpen(false);
      submitForm.resetFields();
      setFileList([]);
      setSelectedMilestone(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSubmission = async (milestone: Milestone) => {
    try {
      setActionLoading(true);
      setSelectedMilestone(milestone);
      
      const historyRes = await getSubmissionHistory(milestone.milestoneId, projectId);
      if (historyRes.isSuccess && historyRes.data) {
        setSubmissionHistory(historyRes.data);
        
        if (historyRes.data.latestSubmission) {
          setCurrentSubmission(historyRes.data.latestSubmission);
          
          const filesRes = await getSubmissionFiles(historyRes.data.latestSubmission.submissionId);
          if (filesRes.isSuccess && filesRes.data) {
            setSubmissionFiles(filesRes.data);
          }
        } else {
          setCurrentSubmission(null);
          setSubmissionFiles([]);
        }
      } else {
        setSubmissionHistory(null);
        setCurrentSubmission(null);
        setSubmissionFiles([]);
      }

      setViewModalOpen(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "blue";
      case "in progress":
        return "orange";
      case "completed":
        return "green";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Milestone> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Deadline",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: (date: string) => {
        const dueDate = dayjs(date);
        const today = dayjs();
        const isOverdue = dueDate.isBefore(today, "day");
        const isDueSoon = dueDate.diff(today, "day") <= 3 && !isOverdue;

        return (
          <span
            className={`text-sm ${
              isOverdue
                ? "text-red-600 font-medium"
                : isDueSoon
                ? "text-orange-600 font-medium"
                : ""
            }`}
          >
            {dueDate.format("MMM DD, YYYY")}
            {isOverdue && " (Overdue)"}
            {isDueSoon && " (Due Soon)"}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      render: (weight: number | null) => (weight ? `${weight}%` : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Milestone) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "view",
            label: "View Submission",
            icon: <Eye className="w-4 h-4" />,
            onClick: () => handleViewSubmission(record),
          },
          ...(isLeader
            ? [
                {
                  key: "submit",
                  label: "Submit Milestone",
                  icon: <FileText className="w-4 h-4" />,
                  onClick: () => {
                    setSelectedMilestone(record);
                    setSubmitModalOpen(true);
                  },
                },
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button
              type="text"
              size="small"
              icon={<MoreHorizontal className="w-4 h-4" />}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      {milestones.length > 0 ? (
        <Table
          columns={columns}
          dataSource={milestones}
          rowKey="milestoneId"
          loading={loading}
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      ) : (
        <Empty description="No milestones available yet" />
      )}

      {/* Submit Modal */}
      <Modal
        title="Submit Milestone"
        open={submitModalOpen}
        onCancel={() => {
          setSubmitModalOpen(false);
          submitForm.resetFields();
          setFileList([]);
        }}
        onOk={() => submitForm.submit()}
        okText="Submit"
        cancelText="Cancel"
        confirmLoading={actionLoading}
        width={600}
    >
      <Form
        form={submitForm}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter submission description' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe what you've accomplished for this milestone..."
          />
        </Form.Item>
        <Form.Item
          label="Submission Notes"
          name="submissionNotes"
        >
          <Input.TextArea
            rows={3}
            placeholder="Any additional notes or comments (optional)..."
          />
        </Form.Item>
        <Form.Item label="Attach Files (Optional)">
          <Upload.Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <UploadCloud size={48} className="mx-auto text-gray-400" />
            </p>
            <p className="ant-upload-text">Click or drag files to upload</p>
            <p className="ant-upload-hint">
              You can upload multiple files at once
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>

    {/* View Submission Modal */}
    <Modal
      title={`Submission History - ${selectedMilestone?.title || ''}`}
      open={viewModalOpen}
      onCancel={() => {
        setViewModalOpen(false);
        setSubmissionHistory(null);
        setCurrentSubmission(null);
        setSubmissionFiles([]);
      }}
      footer={
        <Button onClick={() => {
          setViewModalOpen(false);
          setSubmissionHistory(null);
          setCurrentSubmission(null);
          setSubmissionFiles([]);
        }}>
          Close
        </Button>
      }
      width={900}
    >
      {submissionHistory ? (
        <div className="space-y-6">
          {/* Summary Info */}
          <div className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-sm">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissionHistory.totalSubmissions}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Weight</p>
                <p className="text-2xl font-bold text-purple-600">
                  {submissionHistory.weight}%
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Deadline</p>
                <p className="text-lg font-semibold">
                  {dayjs(submissionHistory.deadline).format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Submission */}
          {currentSubmission ? (
            <div>
              <h4 className="font-semibold text-lg mb-3">Latest Submission</h4>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Version">
                  v{currentSubmission.version}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(currentSubmission.status)}>
                    {currentSubmission.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Submitted At">
                  {dayjs(currentSubmission.submittedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Submitted By">
                  {currentSubmission.submittedByName || currentSubmission.submittedBy}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {currentSubmission.description || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Submission Notes" span={2}>
                  {currentSubmission.submissionNotes || '-'}
                </Descriptions.Item>
                {currentSubmission.grade !== null && (
                  <Descriptions.Item label="Grade">
                    <span className="font-semibold text-lg">
                      {currentSubmission.grade}/100
                    </span>
                  </Descriptions.Item>
                )}
                {currentSubmission.gradedAt && (
                  <Descriptions.Item label="Graded At">
                    {dayjs(currentSubmission.gradedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                {currentSubmission.feedback && (
                  <Descriptions.Item label="Instructor Feedback" span={2}>
                    {currentSubmission.feedback}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Files for latest submission */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Submitted Files ({submissionFiles.length})</h4>
                {submissionFiles.length > 0 ? (
                  <div className="space-y-2">
                    {submissionFiles.map((file) => (
                      <div
                        key={file.fileId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {file.fileName}
                          </a>
                        </div>
                        <span className="text-sm text-gray-500">
                          {dayjs(file.uploadedAt).format('DD/MM HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No files uploaded" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Empty 
                description="No submissions yet for this milestone"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}

          {/* All Versions */}
          {submissionHistory.allVersions && submissionHistory.allVersions.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-3">All Versions ({submissionHistory.allVersions.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {submissionHistory.allVersions.map((submission) => (
                  <div
                    key={submission.submissionId}
                    className="border rounded p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Version {submission.version}</span>
                        <Tag color={getStatusColor(submission.status)}>
                          {submission.status}
                        </Tag>
                        {submission.grade !== null && (
                          <Tag color="green">Grade: {submission.grade}/100</Tag>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {dayjs(submission.submittedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">By:</span> {submission.submittedByName || submission.submittedBy}
                    </p>
                    {submission.description && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Description:</span> {submission.description}
                      </p>
                    )}
                    {submission.feedback && (
                      <p className="text-sm text-orange-700 mt-2 p-2 bg-orange-50 rounded">
                        <span className="font-medium">Feedback:</span> {submission.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Empty 
            description="No submission history available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </Modal>
    </>
  );
}
