import { Card, Button } from "antd";
import { Pencil, Info } from "lucide-react";
import type { GroupDetail } from "../../types/group";

interface GroupOverviewCardProps {
  detail: GroupDetail;
  loading: boolean;
  isLeader: boolean;
  currentUserId?: number;
  onInvite: () => void;
  onUpdate: () => void;
  onKick: (userId: number) => void;
  onLeave: () => void;
}

export default function GroupOverviewCard({
  detail,
  loading,
  isLeader,
  onUpdate,
}: GroupOverviewCardProps) {
  return (
    <Card
      loading={loading}
      className="shadow-md rounded-xl border-l-4 border-l-green-500"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Info className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{detail.groupName}</h3>
            {detail.description && (
              <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
            )}
          </div>
        </div>
        {isLeader && (
          <Button
            icon={<Pencil className="w-4 h-4" />}
            onClick={onUpdate}
            className="cursor-pointer"
          >
            Update
          </Button>
        )}
      </div>
    </Card>
  );
}

