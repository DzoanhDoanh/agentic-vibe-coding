import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/students');
      setStudents(data);
    } catch (error) {
      if(error.response?.status !== 403) message.error('Lỗi tải học sinh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (values) => {
    try {
      await axios.post('/api/students', values);
      message.success('Thêm học sinh thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchStudents();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    { title: 'Tên Học sinh', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Phụ huynh', dataIndex: 'parent_name', key: 'parent_name' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Danh sách Học sinh</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Tham gia Học sinh</Button>
      </div>
      <Table columns={columns} dataSource={students} rowKey="_id" loading={loading}/>
      <Modal title="Thêm Bản Ghi Học sinh" open={isModalVisible} onOk={() => form.submit()} onCancel={() => setIsModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="full_name" label="Tên Học Sinh" rules={[{ required: true }]}><Input size="large"/></Form.Item>
          <Form.Item name="parent_name" label="Tên Phụ Huynh"><Input size="large"/></Form.Item>
          <Form.Item name="phone" label="Số Điện Thoại"><Input size="large"/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default StudentManagement;
