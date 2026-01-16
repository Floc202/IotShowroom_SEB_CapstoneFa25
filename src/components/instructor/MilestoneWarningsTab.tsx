import { useState, useEffect } from "react";
import { Card, Table, Tag, Progress, Empty, Spin, Alert, Collapse, Badge } from "antd";
import { AlertTriangle, FileText } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { getMilestoneWarnings } from "../../api/instructor";
import type { ProjectMilestoneWarning, MilestoneWarningDetail } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";
import dayjs from "dayjs";

interface MilestoneWarningsTabProps {
  classId: number;
}

export default function MilestoneWarningsTab({ classId }: MilestoneWarningsTabProps) {
  const [warnings, setWarnings] = useState<ProjectMilestoneWarning[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWarnings();
  }, [classId]);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await getMilestoneWarnings(classId);
      if (res.isSuccess) {
        setWarnings(res.data || []);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const milestoneColumns: ColumnsType<MilestoneWarningDetail> = [
    {
      title: "Milestone",
      key: "title",
      render: (_: any, record: MilestoneWarningDetail) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{record.title}</span>
        </div>
      ),
    },
    {
      title: "Weight %",
      dataIndex: "weightPercentage",
      key: "weightPercentage",
      width: 100,
      render: (val: number) => (
        <Tag color={val === 0 ? "red" : "blue"}>
          {val.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Status",
      dataIndex: "isCompleted",
      key: "isCompleted",
      width: 100,
      render: (isCompleted: boolean) => (
        <Tag color={isCompleted ? "green" : "orange"}>
          {isCompleted ? "Completed" : "Pending"}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return <Spin />;
  }

  if (warnings.length === 0) {
    return (
      <Empty
        description="No milestone weight warnings"
        style={{ marginTop: 48 }}
      />
    );
  }

  const items = warnings.map((warning) => ({
    key: warning.projectId.toString(),
    label: (
      <div className="flex items-center gap-3 w-full">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {warning.projectTitle}
          </div>
          <div className="text-xs text-gray-500">{warning.groupName}</div>
        </div>
        <Badge
          count={Math.round(warning.missingWeightPercentage) + "%"}
          style={{ backgroundColor: "#ff4d4f" }}
        />
      </div>
    ),
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card size="small" className="bg-blue-50">
            <div className="text-xs text-gray-600 font-medium">Total Weight</div>
            <div className="text-2xl font-bold text-blue-600">
              {warning.totalWeightPercentage.toFixed(1)}%
            </div>
          </Card>
          <Card size="small" className="bg-orange-50">
            <div className="text-xs text-gray-600 font-medium">Missing Weight</div>
            <div className="text-2xl font-bold text-orange-600">
              {warning.missingWeightPercentage.toFixed(1)}%
            </div>
          </Card>
          <Card size="small" className="bg-purple-50">
            <div className="text-xs text-gray-600 font-medium">Total Milestones</div>
            <div className="text-2xl font-bold text-purple-600">
              {warning.totalMilestones}
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-700 mb-1">Weight Distribution</div>
            <Progress
              percent={warning.totalWeightPercentage}
              strokeColor={
                warning.missingWeightPercentage > 0 ? "#ff4d4f" : "#52c41a"
              }
            />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">Milestones Details</div>
          <Table<MilestoneWarningDetail>
            rowKey="milestoneId"
            columns={milestoneColumns}
            dataSource={warning.milestones}
            pagination={false}
            size="small"
          />
        </div>

        {warning.missingWeightPercentage > 0 && (
          <Alert
            message={`Missing ${warning.missingWeightPercentage.toFixed(1)}% weight percentage`}
            description="Please adjust milestone weights to total 100%"
            type="warning"
            showIcon
          />
        )}
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <Alert
        message="Milestone Weight Warnings"
        description={`${warnings.length} project(s) with incomplete milestone weights detected`}
        type="warning"
        showIcon
      />
      <Collapse items={items} />
    </div>
  );
}
