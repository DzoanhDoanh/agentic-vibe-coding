import React, { useContext, useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag, Popconfirm,
  message, Space, Badge, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  LockOutlined, UnlockOutlined, KeyOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Option } = Select;

const roleColor = { SuperAdmin: 'purple', BranchAdmin: 'blue', Teacher: 'green', Student: 'orange' };
const roleLabel = { SuperAdmin: 'Quản trị hệ thống', BranchAdmin: 'Quản lý chi nhánh', Teacher: 'Giáo viên', Student: 'Học sinh' };

const UserManagement = () => {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();
  const [filterRole, setFilterRole] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = filterRole ? { role: filterRole } : {};
      const [usersRes, branchesRes] = await Promise.all([
        axios.get('/api/users', { params }),
        me.role === 'SuperAdmin' ? axios.get('/api/branches') : Promise.resolve({ data: [] }),
      ]);
      setUsers(usersRes.data);
      setBranches(branchesRes.data);
    } catch {
      message.error('Lỗi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterRole]);

  const fetchStudents = async (branchId) => {
    try {
      const { data } = await axios.get('/api/students', branchId ? { params: { branch_id: branchId } } : {});
      setStudents(data);
    } catch { setStudents([]); }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      full_name: record.full_name,
      email: record.email,
      role: record.role,
      branch_id: record.branch_id,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleChangePass = (record) => {
    setEditingUser(record);
    passForm.resetFields();
    setPassModalOpen(true);
  };

  const handleToggleStatus = async (record) => {
    try {
      const newStatus = record.status === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`/api/users/${record._id}`, { status: newStatus });
      message.success(`Đã ${newStatus === 'Active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
      fetchAll();
    } catch { message.error('Lỗi cập nhật trạng thái'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      message.success('Xóa người dùng thành công');
      fetchAll();
    } catch (e) { message.error(e.response?.data?.message || 'Lỗi xóa'); }
  };

  const handleSave = async (values) => {
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await axios.post('/api/users', values);
        message.success('Tạo người dùng thành công');
      }
      setModalOpen(false);
      fetchAll();
    } catch (e) { message.error(e.response?.data?.message || 'Lỗi lưu'); }
  };

  const handleSavePass = async (values) => {
    try {
      await axios.put(`/api/users/${editingUser._id}`, { password: values.password });
      message.success('Đổi mật khẩu thành công');
      setPassModalOpen(false);
    } catch { message.error('Lỗi đổi mật khẩu'); }
  };

  const watchRole = Form.useWatch('role', form);
  const watchBranch = Form.useWatch('branch_id', form);

  useEffect(() => {
    if (watchRole === 'Student' && watchBranch) fetchStudents(watchBranch);
  }, [watchRole, watchBranch]);

  const columns = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name', render: (t) => <span className="font-semibold">{t}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (t) => <span className="text-gray-500 text-sm">{t}</span> },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role',
      render: (r) => <Tag color={roleColor[r]}>{roleLabel[r] || r}</Tag>
    },
    {
      title: 'Chi nhánh', dataIndex: 'branch_id', key: 'branch_id',
      render: (id) => branches.find(b => b._id === id)?.name || (id ? id : <span className="text-gray-400 text-xs">Hệ thống</span>)
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <Badge status={s === 'Active' ? 'success' : 'error'} text={s === 'Active' ? 'Hoạt động' : 'Vô hiệu'} />
    },
    {
      title: 'Hành động', key: 'action',
      render: (_, record) => record._id === me._id ? <span className="text-xs text-gray-400">Tài khoản của bạn</span> : (
        <Space size="small">
          <Tooltip title="Sửa thông tin">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Đổi mật khẩu">
            <Button size="small" icon={<KeyOutlined />} onClick={() => handleChangePass(record)} />
          </Tooltip>
          <Tooltip title={record.status === 'Active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              size="small" danger={record.status === 'Active'}
              icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm title="Xác nhận xóa tài khoản này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0">Quản lý Người dùng</h2>
          <p className="text-gray-400 text-sm mt-1">Toàn quyền tạo, sửa, xóa, khóa/mở tài khoản hệ thống</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Thêm người dùng
        </Button>
      </div>

      <div className="mb-4 flex gap-3 items-center">
        <span className="text-gray-600 font-medium">Lọc theo vai trò:</span>
        <Select value={filterRole} onChange={setFilterRole} style={{ width: 200 }} allowClear placeholder="Tất cả">
          <Option value="SuperAdmin">Quản trị hệ thống</Option>
          <Option value="BranchAdmin">Quản lý chi nhánh</Option>
          <Option value="Teacher">Giáo viên</Option>
          <Option value="Student">Học sinh</Option>
        </Select>
        <span className="text-gray-400 text-sm">Tổng: {users.length} người dùng</span>
      </div>

      <Table
        columns={columns} dataSource={users} rowKey="_id"
        loading={loading} className="shadow-sm rounded-lg"
        rowClassName={(r) => r.status === 'Inactive' ? 'opacity-50' : ''}
      />

      {/* Modal thêm/sửa user */}
      <Modal
        title={editingUser ? `Sửa tài khoản: ${editingUser.full_name}` : 'Thêm người dùng mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
              <Input disabled={!!editingUser} />
            </Form.Item>
          </div>
          {!editingUser && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
              <Select disabled={!!editingUser}>
                {me.role === 'SuperAdmin' && <Option value="SuperAdmin">Quản trị hệ thống</Option>}
                {me.role === 'SuperAdmin' && <Option value="BranchAdmin">Quản lý chi nhánh</Option>}
                <Option value="Teacher">Giáo viên</Option>
                <Option value="Student">Học sinh</Option>
              </Select>
            </Form.Item>
            {me.role === 'SuperAdmin' && (
              <Form.Item name="branch_id" label="Chi nhánh"
                rules={[{ required: watchRole && watchRole !== 'SuperAdmin', message: 'Bắt buộc chọn chi nhánh' }]}>
                <Select allowClear placeholder="Chọn chi nhánh" disabled={watchRole === 'SuperAdmin'}>
                  {branches.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
                </Select>
              </Form.Item>
            )}
          </div>
          {watchRole === 'Student' && (
            <Form.Item name="student_id" label="Gắn với hồ sơ học sinh" rules={[{ required: true }]}>
              <Select placeholder="Chọn hồ sơ học sinh">
                {students.map(s => <Option key={s._id} value={s._id}>{s.full_name} - {s.phone}</Option>)}
              </Select>
            </Form.Item>
          )}
          {editingUser && (
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Option value="Active">Hoạt động</Option>
                <Option value="Inactive">Vô hiệu hóa</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal
        title={`Đổi mật khẩu: ${editingUser?.full_name}`}
        open={passModalOpen} onCancel={() => setPassModalOpen(false)}
        onOk={() => passForm.submit()} okText="Đổi mật khẩu" cancelText="Hủy"
      >
        <Form form={passForm} layout="vertical" onFinish={handleSavePass}>
          <Form.Item name="password" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm" label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[{ required: true }, ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Mật khẩu không khớp'));
              }
            })]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
