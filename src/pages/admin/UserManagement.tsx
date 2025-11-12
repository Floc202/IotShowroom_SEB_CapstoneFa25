import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Tag,
  Dropdown,
  type MenuProps,
} from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Upload as UploadIcon,
  UserPlus,
  FileSpreadsheet,
  MoreVertical,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import type { UserItem, CreateUserRequest, UpdateUserRequest } from "../../types/users";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsersFromExcel,
} from "../../api/users";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

const { Search: AntSearch } = Input;
const { Option } = Select;

const ROLE_MAP = {
  1: "Admin",
  2: "Instructor", 
  3: "Student"
};

const AVAILABLE_ROLES = [
  { roleId: 2, roleName: "Instructor" },
  { roleId: 3, roleName: "Student" }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await listUsers();
      const filteredUsers = (response.data || []).filter(user => user.roleId !== 1);
      setUsers(filteredUsers);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async (values: CreateUserRequest | UpdateUserRequest) => {
    try {
      setSubmitting(true);
      if (editingUser) {
        await updateUser(editingUser.userId, values as UpdateUserRequest);
        toast.success("User updated successfully");
      } else {
        await createUser(values as CreateUserRequest);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportExcel = async () => {
    if (fileList.length === 0) {
      toast.error("Please select an Excel file");
      return;
    }

    try {
      setImporting(true);
      const file = fileList[0].originFileObj;
      const res = await importUsersFromExcel(file);
      toast.success(res.data.message);
      setIsImportModalOpen(false);
      setFileList([]);
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setImporting(false);
    }
  };

  const getRoleName = (roleId: string | number) => {
    return ROLE_MAP[roleId as keyof typeof ROLE_MAP] || "Unknown";
  };

  const getRoleColor = (roleId: string | number) => {
    const roleName = getRoleName(roleId).toLowerCase();
    
    switch (roleName) {
      case 'admin':
        return 'red';
      case 'instructor':
        return 'blue';
      case 'student':
        return 'green';
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.roleId !== null && getRoleName(user.roleId).toLowerCase().includes(searchText.toLowerCase()))
  );

  const createMenuItems = (record: UserItem): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit size={16} />,
      onClick: () => handleEdit(record),
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Delete User"
          description={`Are you sure you want to delete ${record.fullName}?`}
          okText="Delete"
          cancelText="Cancel"
          okType="danger"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDelete(record.userId);
          }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <span className="flex items-center gap-2 text-red-500">
            <Trash2 size={16} />
            Delete
          </span>
        </Popconfirm>
      ),
      onClick: (e) => e?.domEvent?.stopPropagation(),
    },
  ];

  const columns: ColumnsType<UserItem> = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "—",
    },
    {
      title: "Role",
      dataIndex: "roleId",
      key: "roleId",
      render: (roleId) => (
        <Tag color={getRoleColor(roleId)}>
          {getRoleName(roleId)}
        </Tag>
      ),
      filters: AVAILABLE_ROLES.map(role => ({
        text: role.roleName,
        value: role.roleId,
      })),
      onFilter: (value, record) => record.roleId === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{ items: createMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreVertical size={16} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  const uploadProps = {
    fileList,
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        toast.error('You can only upload Excel files!');
        return false;
      }
      setFileList([{ ...file, uid: file.name, name: file.name, originFileObj: file }]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage system users and their roles
            </p>
          </div>
          
          <Space>
            <Button
              type="default"
              icon={<FileSpreadsheet size={16} />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import Excel
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleCreate}
            >
              Add User
            </Button>
          </Space>
        </div>

        <div className="mb-4">
          <AntSearch
            placeholder="Search by name, email, or role..."
            allowClear
            enterButton={<Search size={16} />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserPlus size={18} />
            {editingUser ? "Edit User" : "Create New User"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              {AVAILABLE_ROLES.map((role) => (
                <Option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                }
              ]}
              hasFeedback
            >
              <Input.Password 
                placeholder="Enter password (min 6 chars, uppercase, lowercase, number, special char)" 
              />
            </Form.Item>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UploadIcon size={18} />
            Import Users from Excel
          </div>
        }
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setFileList([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsImportModalOpen(false);
              setFileList([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={importing}
            onClick={handleImportExcel}
            disabled={fileList.length === 0}
          >
            Import
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload an Excel file (.xlsx or .xls)</li>
              <li>• Make sure the file contains the required columns</li>
              <li>• The system will validate and import users</li>
            </ul>
          </div>
          
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <FileSpreadsheet size={48} className="mx-auto text-gray-400" />
            </p>
            <p className="ant-upload-text">
              Click or drag Excel file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for single Excel file upload only
            </p>
          </Upload.Dragger>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;