import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/classes');
      setClasses(data);
    } catch (error) {
      if(error.response?.status !== 403) message.error('Lỗi tải dữ liệu lớp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = async (values) => {
    try {
      await axios.post('/api/classes', values);
      message.success('Thêm lớp thành công');
      setIsModalVisible(false);
      form.resetFields();
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi thêm lớp');
    }
  };

  const columns = [
    { title: 'Tên Lớp', dataIndex: 'name', key: 'name' },
    { title: 'Lịch học', dataIndex: 'schedule_rule', key: 'schedule_rule' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Lớp học</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Thêm Lớp</Button>
      </div>
      <Table columns={columns} dataSource={classes} rowKey="_id" loading={loading}/>
      <Modal title="Thêm Lớp" open={isModalVisible} onOk={() => form.submit()} onCancel={() => setIsModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="name" label="Tên lớp" rules={[{ required: true }]}><Input size="large"/></Form.Item>
          <Form.Item name="schedule_rule" label="Lịch (T2-T4-T6, 18:00)"><Input size="large"/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default ClassManagement;
