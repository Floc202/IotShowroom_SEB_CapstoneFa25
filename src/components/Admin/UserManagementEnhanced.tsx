import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, X, Upload, Key, Download, AlertCircle, FileText } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
}

interface ImportResult {
  success: number;
  duplicates: string[];
  errors: string[];
}

const UserManagementEnhanced: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@iot.edu', role: 'admin' },
    { id: '2', name: 'Dr. Nguyen Van A', email: 'instructor@iot.edu', role: 'instructor' },
    { id: '3', name: 'Tran Van B', email: 'student@iot.edu', role: 'student' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'admin' | 'instructor' | 'student',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'student' });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate email (excluding current user when editing)
    const isDuplicate = users.some(u => 
      u.email === formData.email && u.id !== editingUser?.id
    );

    if (isDuplicate) {
      alert('Email already exists! Please use a different email.');
      return;
    }

    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: formData.name, role: formData.role }
          : u
      ));
      alert('User updated successfully!');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      setUsers([...users, newUser]);
      alert('User added successfully! Default password: student123');
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
      alert('User deleted successfully!');
    }
  };

  const handleResetPassword = (user: User) => {
    if (confirm(`Reset password for ${user.name}?\n\nA new password will be generated and sent to ${user.email}`)) {
      const newPassword = 'Temp' + Math.random().toString(36).substr(2, 8);
      alert(`✅ Password reset successfully!\n\nNew password: ${newPassword}\n\nAn email has been sent to ${user.email}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const result: ImportResult = {
      success: 0,
      duplicates: [],
      errors: [],
    };

    // Skip header row
    const dataLines = lines.slice(1);
    const newUsers: User[] = [];

    dataLines.forEach((line, index) => {
      const [name, email, role] = line.split(',').map(s => s.trim());
      
      // Validation
      if (!name || !email || !role) {
        result.errors.push(`Row ${index + 2}: Missing required fields`);
        return;
      }

      if (!['admin', 'instructor', 'student'].includes(role)) {
        result.errors.push(`Row ${index + 2}: Invalid role "${role}"`);
        return;
      }

      // Check for duplicate in existing users
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        result.duplicates.push(`${email} (${name})`);
        return;
      }

      // Check for duplicate in import batch
      const duplicateInBatch = newUsers.find(u => u.email === email);
      if (duplicateInBatch) {
        result.duplicates.push(`${email} (${name}) - duplicate in file`);
        return;
      }

      // Create new user
      newUsers.push({
        id: Date.now().toString() + index,
        name,
        email,
        role: role as 'admin' | 'instructor' | 'student',
      });
      result.success++;
    });

    // Add new users to the list
    setUsers([...users, ...newUsers]);
    setImportResult(result);
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,role\nNguyen Van A,nvana@iot.edu,student\nTran Thi B,ttb@iot.edu,instructor\nLe Van C,lvc@iot.edu,admin';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage system users and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{users.length}</div>
          <div className="text-blue-100 text-sm mt-1">Total Users</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{users.filter(u => u.role === 'student').length}</div>
          <div className="text-green-100 text-sm mt-1">Students</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{users.filter(u => u.role === 'instructor').length}</div>
          <div className="text-purple-100 text-sm mt-1">Instructors</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-red-100 text-sm mt-1">Admins</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            Import CSV
          </button>

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No users found matching your search criteria.
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Username)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!!editingUser}
                    required
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Import Users from CSV</h2>
              <button onClick={() => { setIsImportModalOpen(false); setImportResult(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  CSV Format Requirements
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Header row: <code className="bg-white px-2 py-1 rounded">name,email,role</code></li>
                  <li>• Valid roles: <code className="bg-white px-2 py-1 rounded">student</code>, <code className="bg-white px-2 py-1 rounded">instructor</code>, <code className="bg-white px-2 py-1 rounded">admin</code></li>
                  <li>• Duplicate emails will be skipped</li>
                  <li>• Default password will be assigned: <code className="bg-white px-2 py-1 rounded">student123</code></li>
                </ul>
              </div>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mb-4"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">Click to select CSV file</span>
              </button>
            </div>

            {importResult && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✓ Import Results</h3>
                  <p className="text-sm text-green-800">
                    Successfully imported {importResult.success} users
                  </p>
                </div>

                {importResult.duplicates.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Duplicate Emails ({importResult.duplicates.length})
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {importResult.duplicates.map((email, i) => (
                        <li key={i}>• {email}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Errors ({importResult.errors.length})
                    </h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      {importResult.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => { setIsImportModalOpen(false); setImportResult(null); }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementEnhanced;
