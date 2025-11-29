import { useState, useEffect } from "react";
import { Card, Timeline, Tag, Descriptions, Button, Empty, Spin, Collapse, Alert } from "antd";
import { FileText, Download, Clock, User, File, CheckCircle } from "lucide-react";
import { getSubmissionHistory } from "../../api/submission";
import type { SubmissionHistory, Submission } from "../../types/submission";
import type { Id } from "../../types/base";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Panel } = Collapse;

interface SubmissionHistoryViewProps {
  projectId: Id;
  milestoneId: Id;
  milestoneTitle?: string;
  role: "student" | "instructor";
}

export default function SubmissionHistoryView({
  projectId,
  milestoneId,
  milestoneTitle,
}: SubmissionHistoryViewProps) {
  const [history, setHistory] = useState<SubmissionHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [projectId, milestoneId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getSubmissionHistory(projectId, milestoneId);
      if (res.isSuccess && res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url: string) => {
    window.open(url, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "blue";
      case "graded":
        return "green";
      case "late":
        return "orange";
      case "pending":
        return "gold";
      default:
        return "default";
    }
  };

  const renderSubmission = (submission: Submission) => (
    <Card
      size="small"
      className="mb-3"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Version {submission.version}</span>
           
          </div>
          <Tag color={getStatusColor(submission.status)}>
            {submission.status?.toUpperCase()}
          </Tag>
        </div>
      }
    >
      <Descriptions size="small" column={1} bordered>
        <Descriptions.Item label="Submitted By">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{submission.submittedByName}</span>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Submitted At">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{dayjs(submission.submittedAt).format("MMM D, YYYY HH:mm")}</span>
            <span className="text-gray-500 text-xs">
              ({dayjs(submission.submittedAt).fromNow()})
            </span>
          </div>
        </Descriptions.Item>
        {submission.description && (
          <Descriptions.Item label="Description">
            {submission.description}
          </Descriptions.Item>
        )}
        {submission.submissionNotes && (
          <Descriptions.Item label="Notes">
            {submission.submissionNotes}
          </Descriptions.Item>
        )}
      </Descriptions>

      {submission.files && submission.files.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">
            Attached Files ({submission.files.length})
          </div>
          <div className="space-y-2">
            {submission.files.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.fileName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.fileSize / 1024).toFixed(2)} KB • {file.fileType}
                    </div>
                  </div>
                </div>
                <Button
                  size="small"
                  type="link"
                  icon={<Download className="w-3 h-3" />}
                  onClick={() => downloadFile(file.fileUrl)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

    </Card>
  );

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!history) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No submission history available"
        />
      </Card>
    );
  }

  const isLate = history.deadline && history.latestSubmission
    ? dayjs(history.latestSubmission.submittedAt).isAfter(dayjs(history.deadline))
    : false;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{milestoneTitle || history.milestoneTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag color="blue">{history.totalSubmissions} submission(s)</Tag>
            {history.latestSubmission?.grade !== null && (
              <Tag color="green" icon={<CheckCircle className="w-3 h-3" />}>
                Graded
              </Tag>
            )}
          </div>
        </div>
      }
    >
      <Alert
        message={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Deadline:</span>
              <span>{dayjs(history.deadline).format("MMM D, YYYY HH:mm")}</span>
              {isLate && <Tag color="orange">Late Submission</Tag>}
            </div>
            <div>
              <span className="text-sm text-gray-600">Weight: </span>
              <Tag color="purple">{history.weight}%</Tag>
            </div>
          </div>
        }
        type={isLate ? "warning" : "info"}
        className="mb-4"
      />

      {history.latestSubmission && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Latest Submission</div>
          {renderSubmission(history.latestSubmission)}
        </div>
      )}

      {history.allVersions && history.allVersions.length > 1 && (
        <Collapse ghost>
          <Panel
            header={
              <span className="text-sm font-medium text-gray-600">
                View All Versions ({history.allVersions.length})
              </span>
            }
            key="1"
          >
            <Timeline mode="left" className="mt-4">
              {history.allVersions.map((submission, index) => (
                <Timeline.Item
                  key={submission.submissionId}
                  color={index === 0 ? "green" : "blue"}
                  dot={
                    submission.grade !== null ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )
                  }
                >
                  {renderSubmission(submission)}
                </Timeline.Item>
              ))}
            </Timeline>
          </Panel>
        </Collapse>
      )}

      {!history.latestSubmission && history.totalSubmissions === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No submissions yet"
        />
      )}
    </Card>
  );
}
