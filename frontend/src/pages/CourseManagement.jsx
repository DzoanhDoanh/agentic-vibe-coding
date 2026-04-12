import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, InputNumber, Space, message, Modal } from 'antd';
import axios from 'axios';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/settings/courses');
            setCourses(data);
        } catch (error) {
            message.error("Lỗi tải danh sách khóa học");
        }
        setLoading(false);
    }
    useEffect(() => { fetchCourses(); }, []);

    const handleAdd = () => {
        form.resetFields();
        setEditingId(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        form.setFieldsValue(record);
        setEditingId(record._id);
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingId) {
                await axios.put(`/api/settings/courses/${editingId}`, values);
                message.success('Cập nhật thành công');
            } else {
                await axios.post('/api/settings/courses', values);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchCourses();
        } catch (error) {
            message.error('Có lỗi xảy ra (Cần SuperAdmin)');
        }
    };

    const columns = [
        { title: 'Tên khóa học', dataIndex: 'name', key: 'name' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        { title: 'Học phí (đ)', dataIndex: 'price', key: 'price', render: v => v?.toLocaleString() },
        { title: 'Hành động', key: 'action', render: (_, record) => (
             <Button onClick={() => handleEdit(record)}>Sửa</Button>
        )}
    ];

    return (
        <div className="font-sans relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Quản lý Khóa Học</h2>
                <Button type="primary" onClick={handleAdd}>Thêm Khóa Học</Button>
            </div>
            <Table columns={columns} dataSource={courses} rowKey="_id" loading={loading} className="shadow-sm rounded-lg" />

            <Modal title={editingId ? 'Sửa Khóa Học' : 'Thêm Khóa Học'} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên khóa học" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
                    <Form.Item name="price" label="Học phí cơ bản (đ)" rules={[{ required: true }]}><InputNumber style={{width:'100%'}} min={0} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default CourseManagement;
