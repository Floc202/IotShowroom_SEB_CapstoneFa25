import { Card, Tag, Button, Table, Empty } from "antd";
import { Users } from "lucide-react";
import type { StudentWithGroup, StudentsWithGroupsResponse } from "../../types/instructor";
import { formatVietnamTime } from "../../utils/helpers";

interface MembersTabProps {
  loading: boolean;
  students: StudentWithGroup[];
  studentsInfo: StudentsWithGroupsResponse | null;
  onCreateRandomGroups: () => void;
}

export default function MembersTab({
  loading,
  students,
  studentsInfo,
  onCreateRandomGroups,
}: MembersTabProps) {
  return (
    <Card loading={loading} title="Class Members">
      {studentsInfo && (
        <div className="mb-4 flex gap-4">
          <Tag color="blue">Total: {studentsInfo.totalStudents}</Tag>
          <Tag color="green">
            With Group: {studentsInfo.studentsWithGroup}
          </Tag>
          <Tag color="orange">
            Without Group: {studentsInfo.studentsWithoutGroup}
          </Tag>
        </div>
      )}
      {studentsInfo && studentsInfo.studentsWithoutGroup > 0 && (
        <div className="mb-4">
          <Button
            type="primary"
            icon={<Users className="w-4 h-4" />}
            onClick={onCreateRandomGroups}
          >
            Create Random Groups
          </Button>
        </div>
      )}
      {students.length > 0 ? (
        <Table
          dataSource={students}
          rowKey="userId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: "Full Name",
              dataIndex: "fullName",
              key: "fullName",
              sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
            },
            {
              title: "Group Status",
              dataIndex: "hasGroup",
              key: "hasGroup",
              width: 120,
              render: (hasGroup: boolean) => (
                <Tag color={hasGroup ? "green" : "red"}>
                  {hasGroup ? "In Group" : "No Group"}
                </Tag>
              ),
              filters: [
                { text: "In Group", value: true },
                { text: "No Group", value: false },
              ],
              onFilter: (value, record) => record.hasGroup === value,
            },
            {
              title: "Group Name",
              dataIndex: "groupName",
              key: "groupName",
              render: (name: string | null) => name || "—",
              sorter: (a, b) => {
                const nameA = a.groupName || "";
                const nameB = b.groupName || "";
                return nameA.localeCompare(nameB);
              },
              defaultSortOrder: "ascend" as const,
            },
            {
              title: "Role",
              dataIndex: "roleInGroup",
              key: "roleInGroup",
              width: 100,
              render: (role: string | null) =>
                role ? (
                  <Tag color={role === "Leader" ? "blue" : "default"}>
                    {role}
                  </Tag>
                ) : (
                  "—"
                ),
            },
            {
              title: "Enrolled At",
              dataIndex: "enrolledAt",
              key: "enrolledAt",
              width: 120,
              render: (date: string) =>
                formatVietnamTime(date, "DD/MM/YYYY"),
            },
            {
              title: "Joined Group At",
              dataIndex: "joinedGroupAt",
              key: "joinedGroupAt",
              width: 140,
              render: (date: string | null) =>
                formatVietnamTime(date, "DD/MM/YYYY"),
            },
          ]}
        />
      ) : (
        <Empty description="No students found" />
      )}
    </Card>
  );
}
