import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Upload,
  Modal,
  Form,
  Input,
  Spin,
  Empty,
} from "antd";
import type { UploadFile } from "antd";
import {
  FileText,
  Video,
  Code,
  Presentation,
  Upload as UploadIcon,
  Send,
  Award,
} from "lucide-react";
import type { FinalSubmission } from "../../types/finalSubmission";
import {
  getFinalSubmission,
  createFinalSubmission,
  uploadFinalSubmissionFile,
  updateFinalSubmission,
  updateFinalSubmissionFile,
} from "../../api/finalSubmission";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

interface FinalSubmissionCardProps {
  projectId: number;
  isLeader: boolean;
}

type FileType = "report" | "presentation" | "sourcecode" | "video";

const fileTypeLabels: Record<FileType, string> = {
  report: "Final Report",
  presentation: "Presentation",
  sourcecode: "Source Code",
  video: "Video Demo",
};

const fileTypeIcons: Record<FileType, ReactElement> = {
  report: <FileText className="w-4 h-4" />,
  presentation: <Presentation className="w-4 h-4" />,
  sourcecode: <Code className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
};

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved") return "green";
  if (s === "pending") return "blue";
  if (s === "revision") return "orange";
  if (s === "rejected") return "red";
  return "default";
};

export default function FinalSubmissionCard({
  projectId,
  isLeader,
}: FinalSubmissionCardProps) {
  const [submission, setSubmission] = useState<FinalSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  
  const [reportFile, setReportFile] = useState<UploadFile[]>([]);
  const [presentationFile, setPresentationFile] = useState<UploadFile[]>([]);
  const [sourceCodeFile, setSourceCodeFile] = useState<UploadFile[]>([]);
  const [videoFile, setVideoFile] = useState<UploadFile[]>([]);

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
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!isLeader) return;
    
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const createRes = await createFinalSubmission(projectId, values);
      if (!createRes.isSuccess || !createRes.data) {
        toast.error(createRes.message || "Failed to create submission");
        return;
      }

      let uploadErrors = 0;

      const fileUploads: Array<{ type: FileType; file: UploadFile }> = [];
      
      if (reportFile.length > 0 && reportFile[0].originFileObj) {
        fileUploads.push({ type: "report", file: reportFile[0] });
      }
      if (presentationFile.length > 0 && presentationFile[0].originFileObj) {
        fileUploads.push({ type: "presentation", file: presentationFile[0] });
      }
      if (sourceCodeFile.length > 0 && sourceCodeFile[0].originFileObj) {
        fileUploads.push({ type: "sourcecode", file: sourceCodeFile[0] });
      }
      if (videoFile.length > 0 && videoFile[0].originFileObj) {
        fileUploads.push({ type: "video", file: videoFile[0] });
      }

      for (const { type, file } of fileUploads) {
        try {
          await uploadFinalSubmissionFile(projectId, type, file.originFileObj as File);
        } catch (err) {
          console.error(`Failed to upload ${type}:`, err);
          uploadErrors++;
        }
      }

      if (uploadErrors > 0) {
        toast.success(
          `Submission created but ${uploadErrors} file(s) failed to upload`
        );
      } else {
        toast.success("Final submission created successfully!");
      }

      setSubmitModalOpen(false);
      form.resetFields();
      setReportFile([]);
      setPresentationFile([]);
      setSourceCodeFile([]);
      setVideoFile([]);
      fetchSubmission();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isLeader) return;
    
    try {
      const values = await updateForm.validateFields();
      setSubmitting(true);

      // Update repository URL and notes
      const updateRes = await updateFinalSubmission(projectId, {
        repositoryUrl: values.repositoryUrl,
        submissionNotes: values.submissionNotes,
      });
      
      if (!updateRes.isSuccess) {
        toast.error(updateRes.message || "Failed to update submission");
        return;
      }

      let uploadErrors = 0;

      // Upload new files if provided
      const fileUploads: Array<{ type: FileType; file: UploadFile }> = [];
      
      if (reportFile.length > 0 && reportFile[0].originFileObj) {
        fileUploads.push({ type: "report", file: reportFile[0] });
      }
      if (presentationFile.length > 0 && presentationFile[0].originFileObj) {
        fileUploads.push({ type: "presentation", file: presentationFile[0] });
      }
      if (sourceCodeFile.length > 0 && sourceCodeFile[0].originFileObj) {
        fileUploads.push({ type: "sourcecode", file: sourceCodeFile[0] });
      }
      if (videoFile.length > 0 && videoFile[0].originFileObj) {
        fileUploads.push({ type: "video", file: videoFile[0] });
      }

      for (const { type, file } of fileUploads) {
        try {
          await updateFinalSubmissionFile(projectId, type, file.originFileObj as File);
        } catch (err) {
          console.error(`Failed to upload ${type}:`, err);
          uploadErrors++;
        }
      }

      if (uploadErrors > 0) {
        toast.success(
          `Submission updated but ${uploadErrors} file(s) failed to upload`
        );
      } else {
        toast.success("Final submission updated successfully!");
      }

      setUpdateModalOpen(false);
      updateForm.resetFields();
      setReportFile([]);
      setPresentationFile([]);
      setSourceCodeFile([]);
      setVideoFile([]);
      fetchSubmission();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const getFileUrl = (fileType: FileType): string | null => {
    if (!submission) return null;
    switch (fileType) {
      case "report":
        return submission.finalReportUrl;
      case "presentation":
        return submission.presentationUrl;
      case "sourcecode":
        return submission.sourceCodeUrl;
      case "video":
        return submission.videoDemoUrl;
      default:
        return null;
    }
  };

  const renderFileInfo = (fileType: FileType) => {
    const fileUrl = getFileUrl(fileType);

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2">
          {fileTypeIcons[fileType]}
          <span className="font-medium">{fileTypeLabels[fileType]}</span>
        </div>
        <div>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View File
            </a>
          ) : (
            <span className="text-gray-400 text-sm">Not uploaded</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  if (!submission) {
    return (
      <Card className="shadow-sm" title="Final Submission">
        <Empty description="No final submission yet">
          {isLeader && (
            <Button
              type="primary"
              icon={<Send className="w-4 h-4" />}
              onClick={() => setSubmitModalOpen(true)}
              className="mt-4"
            >
              Submit Final Project
            </Button>
          )}
        </Empty>

        <Modal
          title="Submit Final Project"
          open={submitModalOpen}
          onCancel={() => {
            setSubmitModalOpen(false);
            form.resetFields();
            setReportFile([]);
            setPresentationFile([]);
            setSourceCodeFile([]);
            setVideoFile([]);
          }}
          style={{top: 20}}
          onOk={handleSubmit}
          okText="Submit"
          confirmLoading={submitting}
          width={700}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Repository URL"
              name="repositoryUrl"
              rules={[
                { required: true, message: "Please enter repository URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://github.com/username/repository" />
            </Form.Item>
            
            <Form.Item
              label="Submission Notes"
              name="submissionNotes"
              rules={[
                { required: true, message: "Please enter submission notes" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter any notes about your final submission..."
              />
            </Form.Item>

            <div className="space-y-3">
              <Form.Item label="Final Report (Optional)">
                <Upload
                  maxCount={1}
                  fileList={reportFile}
                  onChange={({ fileList }) => setReportFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadIcon className="w-4 h-4" />}>
                    Choose File
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Presentation (Optional)">
                <Upload
                  maxCount={1}
                  fileList={presentationFile}
                  onChange={({ fileList }) => setPresentationFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadIcon className="w-4 h-4" />}>
                    Choose File
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Source Code (Optional)">
                <Upload
                  maxCount={1}
                  fileList={sourceCodeFile}
                  onChange={({ fileList }) => setSourceCodeFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadIcon className="w-4 h-4" />}>
                    Choose File
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Video Demo (Optional)">
                <Upload
                  maxCount={1}
                  fileList={videoFile}
                  onChange={({ fileList }) => setVideoFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadIcon className="w-4 h-4" />}>
                    Choose File
                  </Button>
                </Upload>
              </Form.Item>
            </div>
          </Form>
        </Modal>
      </Card>
    );
  }

  const canUpdate = submission && submission.status.toLowerCase() !== "graded" && isLeader;

  return (
    <Card 
      className="shadow-sm" 
      title="Final Submission"
      extra={
        canUpdate && (
          <Button
            type="primary"
            icon={<UploadIcon className="w-4 h-4" />}
            onClick={() => {
              updateForm.setFieldsValue({
                repositoryUrl: submission.repositoryUrl,
                submissionNotes: submission.submissionNotes,
              });
              setUpdateModalOpen(true);
            }}
          >
            Update Submission
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Status" span={2}>
            <Tag color={getStatusColor(submission.status)}>
              {submission.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Submitted By">
            {submission.submittedByName}
          </Descriptions.Item>
          <Descriptions.Item label="Submitted At">
            {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {dayjs(submission.lastUpdatedAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {dayjs(submission.deadline).format("DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Repository URL" span={2}>
            <a
              href={submission.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {submission.repositoryUrl}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="Submission Notes" span={2}>
            {submission.submissionNotes}
          </Descriptions.Item>
        </Descriptions>

        {submission.grade !== null && (
          <div className="mt-6 p-5 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Final Grade</div>
                  <div className="text-2xl font-bold text-green-700">
                    {submission.grade}
                    <span className="text-lg text-gray-500">/100</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Graded by</div>
                <div className="font-medium text-gray-700">
                  {submission.gradedByName || "-"}
                </div>
                {submission.gradedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {dayjs(submission.gradedAt).format("MMM D, YYYY")}
                  </div>
                )}
              </div>
            </div>
            {submission.feedback && (
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Instructor Feedback
                </div>
                <div className="text-sm text-gray-700">
                  {submission.feedback}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-3">Deliverables</h4>
          <div className="space-y-2">
            {(["report", "presentation", "sourcecode", "video"] as FileType[]).map(
              (fileType) => (
                <div key={fileType}>{renderFileInfo(fileType)}</div>
              )
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Update Final Submission"
        open={updateModalOpen}
        onCancel={() => {
          setUpdateModalOpen(false);
          updateForm.resetFields();
          setReportFile([]);
          setPresentationFile([]);
          setSourceCodeFile([]);
          setVideoFile([]);
        }}
        style={{top: 20}}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={submitting}
        width={700}
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            label="Repository URL"
            name="repositoryUrl"
            rules={[
              { required: true, message: "Please enter repository URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://github.com/username/repository" />
          </Form.Item>
          
          <Form.Item
            label="Submission Notes"
            name="submissionNotes"
            rules={[
              { required: true, message: "Please enter submission notes" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter any notes about your final submission..."
            />
          </Form.Item>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-2">
              Upload new files to replace existing ones (Optional)
            </div>
            
            <Form.Item label="Final Report">
              {submission?.finalReportUrl && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-600">Current: </span>
                  <a
                    href={submission.finalReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View existing file
                  </a>
                </div>
              )}
              <Upload
                maxCount={1}
                fileList={reportFile}
                onChange={({ fileList }) => setReportFile(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadIcon className="w-4 h-4" />}>
                  {submission?.finalReportUrl ? "Replace File" : "Choose File"}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Presentation">
              {submission?.presentationUrl && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-600">Current: </span>
                  <a
                    href={submission.presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View existing file
                  </a>
                </div>
              )}
              <Upload
                maxCount={1}
                fileList={presentationFile}
                onChange={({ fileList }) => setPresentationFile(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadIcon className="w-4 h-4" />}>
                  {submission?.presentationUrl ? "Replace File" : "Choose File"}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Source Code">
              {submission?.sourceCodeUrl && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-600">Current: </span>
                  <a
                    href={submission.sourceCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View existing file
                  </a>
                </div>
              )}
              <Upload
                maxCount={1}
                fileList={sourceCodeFile}
                onChange={({ fileList }) => setSourceCodeFile(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadIcon className="w-4 h-4" />}>
                  {submission?.sourceCodeUrl ? "Replace File" : "Choose File"}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Video Demo">
              {submission?.videoDemoUrl && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-600">Current: </span>
                  <a
                    href={submission.videoDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View existing file
                  </a>
                </div>
              )}
              <Upload
                maxCount={1}
                fileList={videoFile}
                onChange={({ fileList }) => setVideoFile(fileList)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadIcon className="w-4 h-4" />}>
                  {submission?.videoDemoUrl ? "Replace File" : "Choose File"}
                </Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
