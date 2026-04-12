import React, { useContext, useEffect, useState } from 'react';
import {
  Tabs, Form, Input, InputNumber, Select, Button, Table, Popconfirm,
  message, Modal, Card, Statistic, Tag, Space, Divider, Alert
} from 'antd';
import {
  ReadOutlined, HomeOutlined, SettingOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  BankOutlined, TeamOutlined, DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { TabPane } = Tabs;
const { Option } = Select;

// =================== COURSES TAB ===================
const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/settings/courses'); setCourses(data); }
    catch { message.error('Lỗi tải khóa học'); }
    setLoading(false);
  };
  useEffect(() => { fetchCourses(); }, []);

  const openAdd = () => { form.resetFields(); setEditingId(null); setModalOpen(true); };
  const openEdit = (r) => { form.setFieldsValue(r); setEditingId(r._id); setModalOpen(true); };

  const handleSave = async (values) => {
    try {
      if (editingId) await axios.put(`/api/settings/courses/${editingId}`, values);
      else await axios.post('/api/settings/courses', values);
      message.success('Lưu thành công'); setModalOpen(false); fetchCourses();
    } catch (e) { message.error(e.response?.data?.message || 'Lỗi lưu'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/settings/courses/${id}`); message.success('Xóa thành công'); fetchCourses(); }
    catch (e) { message.error(e.response?.data?.message || 'Lỗi xóa'); }
  };

  const cols = [
    { title: 'Tên khóa học', dataIndex: 'name', key: 'name', render: t => <span className="font-semibold">{t}</span> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Học phí (đ)', dataIndex: 'price', key: 'price',
      render: v => <span className="text-green-600 font-medium">{(v || 0).toLocaleString('vi-VN')} đ</span>
    },
    {
      title: 'Hành động', key: 'act', render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa khóa học này?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-sm">{courses.length} khóa học trong hệ thống</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm khóa học</Button>
      </div>
      <Table columns={cols} dataSource={courses} rowKey="_id" loading={loading} className="rounded-lg" />
      <Modal
        title={editingId ? 'Sửa khóa học' : 'Thêm khóa học mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên khóa học" rules={[{ required: true, message: 'Nhập tên khóa học' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Học phí (VNĐ)" rules={[{ required: true, message: 'Nhập học phí' }]}>
            <InputNumber
              style={{ width: '100%' }} min={0}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/,/g, '')}
              placeholder="Ví dụ: 2000000"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// =================== ROOMS TAB ===================
const RoomsTab = ({ branches, isSuperAdmin, myBranch }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchRooms = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/settings/rooms'); setRooms(data); }
    catch (e) { message.error(e.response?.data?.message || 'Lỗi tải phòng học'); }
    setLoading(false);
  };
  useEffect(() => { fetchRooms(); }, []);

  const openAdd = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'Available' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    form.setFieldsValue({
      name: r.name,
      capacity: r.capacity,
      status: r.status,
      branch_id: r.branch_id?._id || r.branch_id,
    });
    setEditingId(r._id);
    setModalOpen(true);
  };

  const handleSave = async (values) => {
    try {
      // For BranchAdmin: don't send branch_id; middleware will inject it
      // For SuperAdmin: send branch_id from form
      const payload = isSuperAdmin
        ? values
        : { name: values.name, capacity: values.capacity, status: values.status };

      if (editingId) await axios.put(`/api/settings/rooms/${editingId}`, payload);
      else await axios.post('/api/settings/rooms', payload);
      message.success('Lưu thành công'); setModalOpen(false); fetchRooms();
    } catch (e) { message.error(e.response?.data?.message || 'Lỗi lưu'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/settings/rooms/${id}`); message.success('Xóa thành công'); fetchRooms(); }
    catch (e) { message.error(e.response?.data?.message || 'Lỗi xóa'); }
  };

  const getBranchName = (r) => {
    if (r.branch_id?.name) return r.branch_id.name;
    const found = branches.find(b => b._id === (r.branch_id?._id || r.branch_id));
    return found?.name || myBranch?.name || '-';
  };

  const cols = [
    { title: 'Tên phòng', dataIndex: 'name', key: 'name', render: t => <span className="font-semibold">{t}</span> },
    { title: 'Sức chứa', dataIndex: 'capacity', key: 'capacity', render: v => `${v || '—'} học sinh` },
    { title: 'Chi nhánh', key: 'branch', render: (_, r) => getBranchName(r) },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: v => <Tag color={v === 'Available' ? 'green' : 'orange'}>{v === 'Available' ? 'Sẵn sàng' : 'Bảo trì'}</Tag>
    },
    {
      title: 'Hành động', key: 'act', render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa phòng học này?" onConfirm={() => handleDelete(r._id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      {!isSuperAdmin && myBranch && (
        <Alert
          className="mb-4"
          message={`Phòng học sẽ được tạo trong chi nhánh: ${myBranch.name}`}
          type="info" showIcon
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-sm">{rooms.length} phòng học</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm phòng học</Button>
      </div>
      <Table columns={cols} dataSource={rooms} rowKey="_id" loading={loading} className="rounded-lg" />
      <Modal
        title={editingId ? 'Sửa phòng học' : 'Thêm phòng học mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên phòng học" rules={[{ required: true, message: 'Nhập tên phòng' }]}>
            <Input placeholder="Ví dụ: Phòng A1" />
          </Form.Item>
          <Form.Item name="capacity" label="Sức chứa (số học sinh)">
            <InputNumber style={{ width: '100%' }} min={1} max={200} placeholder="20" />
          </Form.Item>
          {isSuperAdmin && (
            <Form.Item
              name="branch_id" label="Chi nhánh"
              rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
            >
              <Select placeholder="Chọn chi nhánh" loading={branches.length === 0}>
                {branches.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Available">Sẵn sàng</Option>
              <Option value="Maintenance">Đang bảo trì</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// =================== SYSTEM INFO TAB (SuperAdmin only) ===================
const SystemInfoTab = ({ branches }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Tổng quan hệ thống</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-xl border border-blue-100 bg-blue-50">
          <Statistic title="Chi nhánh" value={branches.length} prefix={<BankOutlined />} valueStyle={{ color: '#3b82f6' }} />
        </Card>
        <Card className="rounded-xl border border-green-100 bg-green-50">
          <Statistic title="Tổng lớp học" value={stats?.totalClasses || 0} prefix={<ReadOutlined />} valueStyle={{ color: '#22c55e' }} />
        </Card>
        <Card className="rounded-xl border border-orange-100 bg-orange-50">
          <Statistic title="Học sinh" value={stats?.totalStudents || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#f97316' }} />
        </Card>
        <Card className="rounded-xl border border-purple-100 bg-purple-50">
          <Statistic title="Doanh thu tháng" value={stats?.monthlyRevenue || 0}
            formatter={v => `${Number(v).toLocaleString('vi-VN')} đ`}
            prefix={<DollarOutlined />} valueStyle={{ color: '#a855f7' }}
          />
        </Card>
      </div>
      <Divider>Danh sách Chi nhánh</Divider>
      <Table
        dataSource={branches} rowKey="_id"
        columns={[
          { title: 'Tên chi nhánh', dataIndex: 'name', key: 'name', render: t => <span className="font-semibold">{t}</span> },
          { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
          { title: 'Số điện thoại', dataIndex: 'contact_phone', key: 'contact_phone' },
          {
            title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active',
            render: v => <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Tạm ngưng'}</Tag>
          },
        ]}
        pagination={false} className="rounded-lg"
      />
    </div>
  );
};

// =================== MAIN SETTINGS PAGE ===================
const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [branches, setBranches] = useState([]);
  const [myBranch, setMyBranch] = useState(null);
  const isSuperAdmin = user?.role === 'SuperAdmin';

  useEffect(() => {
    if (isSuperAdmin) {
      // SuperAdmin: fetch all branches to pick from
      axios.get('/api/branches').then(r => setBranches(r.data)).catch(() => {});
    } else if (user?.branch_id) {
      // BranchAdmin: fetch just their branch info to display
      axios.get('/api/branches').then(r => {
        const mine = r.data.find(b => b._id === user.branch_id || b._id === String(user.branch_id));
        if (mine) setMyBranch(mine);
      }).catch(() => {});
    }
  }, [isSuperAdmin, user?.branch_id]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 m-0">Cài đặt & Cấu hình Hệ thống</h2>
        <p className="text-gray-400 text-sm mt-1">
          {isSuperAdmin ? 'Toàn quyền cấu hình hệ thống' : `Quản lý cấu hình chi nhánh${myBranch ? `: ${myBranch.name}` : ''}`}
        </p>
      </div>

      <Tabs defaultActiveKey="courses" type="card">
        <TabPane tab={<span><ReadOutlined /> Khóa học</span>} key="courses">
          <div className="p-2 bg-white rounded-b-xl">
            <CoursesTab />
          </div>
        </TabPane>
        <TabPane tab={<span><HomeOutlined /> Phòng học</span>} key="rooms">
          <div className="p-2 bg-white rounded-b-xl">
            <RoomsTab branches={branches} isSuperAdmin={isSuperAdmin} myBranch={myBranch} />
          </div>
        </TabPane>
        {isSuperAdmin && (
          <TabPane tab={<span><SettingOutlined /> Tổng quan hệ thống</span>} key="system">
            <div className="p-2 bg-white rounded-b-xl">
              <SystemInfoTab branches={branches} />
            </div>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default AdminSettings;
