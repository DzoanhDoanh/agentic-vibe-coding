import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/branches');
      setBranches(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingBranch) {
        await axios.put(`/api/branches/${editingBranch._id}`, values);
        message.success('Cập nhật chi nhánh thành công');
      } else {
        await axios.post('/api/branches', values);
        message.success('Thêm chi nhánh thành công');
      }
      setIsModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
      fetchBranches();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (record) => {
    setEditingBranch(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/branches/${id}`);
      message.success('Đã xóa chi nhánh');
      fetchBranches();
    } catch (error) {
      message.error('Lỗi khi xóa!');
    }
  };

  const columns = [
    {
      title: 'Tên Cơ sở',
      dataIndex: 'name',
      key: 'name',
      render: text => <strong>{text}</strong>
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} type="default" size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDelete(record._id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Danh sách Cơ sở (Chi nhánh)</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingBranch(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Thêm Cơ sở Mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={branches} 
        rowKey="_id" 
        loading={loading}
      />

      <Modal 
        title={editingBranch ? "Cập nhật Chi nhánh" : "Thêm Chi nhánh mới"} 
        open={isModalVisible} 
        onOk={() => form.submit()} 
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBranch(null);
          form.resetFields();
        }}
        okText="Lưu lại"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="name" 
            label="Tên chi nhánh" 
            rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh!' }]}
          >
            <Input placeholder="VD: Chi nhánh Cầu Giấy" size="large" />
          </Form.Item>
          
          <Form.Item 
            name="address" 
            label="Địa chỉ" 
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="VD: 123 Cầu Giấy, Hà Nội" size="large" />
          </Form.Item>

          <Form.Item 
            name="contact_phone" 
            label="Số liên lạc"
          >
            <Input placeholder="Số điện thoại" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchManagement;
