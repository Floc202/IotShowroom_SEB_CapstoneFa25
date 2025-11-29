import { useEffect, useState } from "react";
import { Timeline, Tag, Card, Empty, Spin, Button, Modal } from "antd";
import { History, User, MessageSquare, Clock } from "lucide-react";
import { getProjectStatusHistory } from "../../api/project";
import type { ProjectStatusHistory as StatusHistory } from "../../types/project";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface ProjectStatusHistoryProps {
  projectId: number;
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "blue";
    case "APPROVED":
      return "green";
    case "REVISION":
      return "orange";
    case "REJECTED":
      return "red";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "🟢";
    case "REJECTED":
      return "🔴";
    case "REVISION":
      return "🟠";
    case "PENDING":
      return "🔵";
    default:
      return "⚪";
  }
};

export default function ProjectStatusHistory({
  projectId,
}: ProjectStatusHistoryProps) {
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getProjectStatusHistory(projectId);
      if (res.isSuccess && res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <div className="mt-2 text-gray-500">Loading status history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return <Empty description="No status history available" />;
  }

  return (
    <Timeline
      mode="left"
      className="mt-0 pt-0"
      style={{ marginTop: 0, paddingTop: 0 }}
      items={history.map((item, index) => ({
        color: getStatusColor(item.status),
        dot: (
          <div className="text-lg" style={{ marginTop: -4 }}>
            {getStatusIcon(item.status)}
          </div>
        ),
        children: (
          <Card
            size="small"
            className={`shadow-sm ${
              index === 0 ? "border-2 border-blue-400" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tag
                  color={getStatusColor(item.status)}
                  className="text-sm font-medium"
                >
                  {item.status.toUpperCase()}
                </Tag>
                {index === 0 && (
                  <Tag color="blue" className="text-xs">
                    Latest
                  </Tag>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="font-medium">{item.reviewerName}</span>
              </div>

              {item.comment && (
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-gray-700 bg-gray-50 p-2 rounded flex-1">
                    {item.comment}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(item.reviewedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </Card>
        ),
      }))}
    />
  );
}

export function ProjectStatusHistoryModal({
  projectId,
  projectTitle,
  open,
  onClose,
}: {
  projectId: number;
  projectTitle: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      style={{ top: 20 }}
      width={700}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <span>Status History: {projectTitle}</span>
        </div>
      }
    >
      <ProjectStatusHistory projectId={projectId} />
    </Modal>
  );
}
