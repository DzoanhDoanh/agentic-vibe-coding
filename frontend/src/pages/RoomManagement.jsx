import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, InputNumber, message, Modal } from 'antd';
import axios from 'axios';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/settings/rooms');
            setRooms(data);
        } catch (error) {
            message.error("Lỗi tải danh sách phòng học");
        }
        setLoading(false);
    }
    useEffect(() => { fetchRooms(); }, []);

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
                await axios.put(`/api/settings/rooms/${editingId}`, values);
                message.success('Cập nhật thành công');
            } else {
                await axios.post('/api/settings/rooms', values);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchRooms();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        { title: 'Tên phòng', dataIndex: 'name', key: 'name' },
        { title: 'Sức chứa (Học sinh)', dataIndex: 'capacity', key: 'capacity' },
        { title: 'Cơ sở', dataIndex: ['branch_id', 'name'], key: 'branch' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
        { title: 'Hành động', key: 'action', render: (_, record) => (
             <Button onClick={() => handleEdit(record)}>Sửa</Button>
        )}
    ];

    return (
        <div className="font-sans relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Quản lý Phòng Học</h2>
                <Button type="primary" onClick={handleAdd}>Thêm Phòng</Button>
            </div>
            <Table columns={columns} dataSource={rooms} rowKey="_id" loading={loading} className="shadow-sm rounded-lg" />

            <Modal title={editingId ? 'Sửa Phòng Học' : 'Thêm Phòng Học'} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên phòng" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="capacity" label="Sức chứa"><InputNumber style={{width:'100%'}} min={1} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default RoomManagement;
