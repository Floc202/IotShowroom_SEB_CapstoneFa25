import { Modal, Button, Card, Tag } from "antd";
import type { RandomGroupCreationResult, ClassConfig } from "../../types/instructor";

interface RandomGroupModalProps {
  open: boolean;
  loading: boolean;
  result: RandomGroupCreationResult | null;
  config: ClassConfig | null;
  onCancel: () => void;
  onCreate: () => void;
}

export default function RandomGroupModal({
  open,
  loading,
  result,
  config,
  onCancel,
  onCreate,
}: RandomGroupModalProps) {
  return (
    <Modal
      title="Create Random Groups"
      open={open}
      onCancel={onCancel}
      footer={
        result
          ? [
              <Button key="close" type="primary" onClick={onCancel}>
                Close
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onCancel}>
                Cancel
              </Button>,
              <Button
                key="create"
                type="primary"
                loading={loading}
                onClick={onCreate}
              >
                Create Groups
              </Button>,
            ]
      }
      width={800}
    >
      {result ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">Creation Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Total Students:</span>
                <span className="ml-2 font-semibold">{result.totalStudentsInClass}</span>
              </div>
              <div>
                <span className="text-gray-600">Already in Groups:</span>
                <span className="ml-2 font-semibold">{result.studentsAlreadyInGroups}</span>
              </div>
              <div>
                <span className="text-gray-600">Unassigned Students:</span>
                <span className="ml-2 font-semibold text-orange-600">{result.unassignedStudents}</span>
              </div>
              <div>
                <span className="text-gray-600">Groups Created:</span>
                <span className="ml-2 font-semibold text-green-600">{result.groupsCreated}</span>
              </div>
              <div>
                <span className="text-gray-600">Students Assigned:</span>
                <span className="ml-2 font-semibold text-green-600">{result.studentsAssigned}</span>
              </div>
              <div>
                <span className="text-gray-600">Students Remaining:</span>
                <span className="ml-2 font-semibold text-red-600">{result.studentsRemaining}</span>
              </div>
            </div>
          </div>

          {result.createdGroups.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Created Groups</h4>
              <div className="space-y-3">
                {result.createdGroups.map((group) => (
                  <Card key={group.groupId} size="small" className="bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-base">{group.groupName}</span>
                          <Tag color="blue" className="ml-2">{group.memberCount} members</Tag>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Leader:</span>
                        <span className="ml-2 font-medium">{group.leaderName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Members:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {group.memberNames.map((name, idx) => (
                            <Tag key={idx} color="default">{name}</Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-700">
            This action will automatically create groups for all students who are not currently in a group.
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Note:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Groups will be created based on class configuration (min/max members per group)</li>
              <li>• A random student will be assigned as the group leader</li>
              <li>• Group names will be auto-generated</li>
              <li>• Students already in groups will not be affected</li>
            </ul>
          </div>
          {config && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Current Configuration:</h4>
              <div className="text-sm space-y-1">
                <div>Min Members Per Group: <span className="font-semibold">{config.minMembersPerGroup}</span></div>
                <div>Max Members Per Group: <span className="font-semibold">{config.maxMembersPerGroup}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
