import { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, AutoComplete, Avatar, Spin, Tag } from "antd";
import { Search, Users } from "lucide-react";
import { getUnassignedStudents } from "../../api/instructor";
import type { UnassignedStudent } from "../../types/instructor";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface GroupModalsProps {
  inviteOpen: boolean;
  updateOpen: boolean;
  projectOpen: boolean;
  projectUpdateOpen: boolean;
  actionLoading: boolean;
  classId?: number;
  inviteForm: any;
  updateForm: any;
  projectForm: any;
  projectUpdateForm: any;
  onInviteCancel: () => void;
  onInviteOk: (selectedUserIds: number[]) => void;
  onUpdateCancel: () => void;
  onUpdateOk: () => void;
  onProjectCreateCancel: () => void;
  onProjectCreateOk: () => void;
  onProjectUpdateCancel: () => void;
  onProjectUpdateOk: () => void;
}

export default function GroupModals({
  inviteOpen,
  updateOpen,
  projectOpen,
  projectUpdateOpen,
  actionLoading,
  classId,
  updateForm,
  projectForm,
  projectUpdateForm,
  onInviteCancel,
  onInviteOk,
  onUpdateCancel,
  onUpdateOk,
  onProjectCreateCancel,
  onProjectCreateOk,
  onProjectUpdateCancel,
  onProjectUpdateOk,
}: GroupModalsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<UnassignedStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<UnassignedStudent[]>([]);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!inviteOpen) {
      setStudents([]);
      setSearchQuery("");
      setSelectedStudents([]);
    }
  }, [inviteOpen]);

  const searchStudents = async (query: string) => {
    if (!classId || !query.trim()) {
      setStudents([]);
      return;
    }
    
    try {
      setSearching(true);
      const res = await getUnassignedStudents(classId, query);
      const results = res.data?.students || [];
      const filtered = results.filter(
        s => !selectedStudents.some(sel => sel.userId === s.userId)
      );
      setStudents(filtered);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      searchStudents(value);
    }, 300);
  };

  const handleSelect = (_value: string, option: any) => {
    const student = students.find(s => s.userId === option.key);
    if (student && !selectedStudents.some(s => s.userId === student.userId)) {
      setSelectedStudents([...selectedStudents, student]);
      setSearchQuery("");
      setStudents([]);
    }
  };

  const handleRemoveStudent = (userId: number) => {
    setSelectedStudents(selectedStudents.filter(s => s.userId !== userId));
  };

  const handleInviteOk = () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to invite");
      return;
    }
    onInviteOk(selectedStudents.map(s => s.userId));
  };

  const handleInviteCancel = () => {
    setSelectedStudents([]);
    setSearchQuery("");
    setStudents([]);
    onInviteCancel();
  };

  return (
    <>
      <Modal
        open={inviteOpen}
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Invite Members</span>
          </div>
        }
        onCancel={handleInviteCancel}
        onOk={handleInviteOk}
        confirmLoading={actionLoading}
        okText="Send Invitations"
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search and add students
            </label>
            <AutoComplete
              value={searchQuery}
              onChange={handleSearch}
              onSelect={handleSelect}
              options={students.map((student) => ({
                key: student.userId,
                value: student.email,
                label: (
                  <div className="flex items-center gap-3 py-2">
                    <Avatar size={32} src={student.avatarUrl}>
                      {student.fullName[0]}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{student.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </div>
                ),
              }))}
              notFoundContent={
                searching ? (
                  <div className="text-center py-4">
                    <Spin size="small" />
                    <div className="text-xs text-gray-500 mt-2">Searching...</div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No students found
                  </div>
                ) : null
              }
              className="w-full"
            >
              <Input
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                placeholder="Type name or email to search..."
                size="large"
              />
            </AutoComplete>
          </div>

          {selectedStudents.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected students ({selectedStudents.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {selectedStudents.map((student) => (
                  <Tag
                    key={student.userId}
                    closable
                    onClose={() => handleRemoveStudent(student.userId)}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <Avatar size={20} src={student.avatarUrl}>
                      {student.fullName[0]}
                    </Avatar>
                    <span>{student.fullName}</span>
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={updateOpen}
        title="Update Group Information"
        onCancel={onUpdateCancel}
        onOk={onUpdateOk}
        confirmLoading={actionLoading}
        okText="Save Changes"
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="groupName"
            label="Group Name"
            rules={[{ required: true, message: "Enter group name" }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter group description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={projectOpen}
        title="Create New Project"
        onCancel={onProjectCreateCancel}
        onOk={onProjectCreateOk}
        confirmLoading={actionLoading}
        okText="Create Project"
        width={700}
      >
        <Form form={projectForm} layout="vertical">
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: "Enter project title" }]}
          >
            <Input placeholder="Enter project title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Enter project description" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter project description, purpose, and details"
            />
          </Form.Item>
          <Form.Item
            name="component"
            label="Component"
            rules={[{ required: true, message: "Enter component" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="What components will be used?"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={projectUpdateOpen}
        title="Update Project Information"
        onCancel={onProjectUpdateCancel}
        onOk={onProjectUpdateOk}
        confirmLoading={actionLoading}
        okText="Save Changes"
        width={700}
      >
        <Form form={projectUpdateForm} layout="vertical">
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: "Enter project title" }]}
          >
            <Input placeholder="Enter project title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Enter project description" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter project description, purpose, and details"
            />
          </Form.Item>
          <Form.Item
            name="component"
            label="Component"
            rules={[{ required: true, message: "Enter component" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="What components will be used?"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
