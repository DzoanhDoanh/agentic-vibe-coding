import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Modal, InputNumber } from 'antd';
import axios from 'axios';

const TuitionManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [paidAmount, setPaidAmount] = useState(0);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/invoices');
            setInvoices(data);
        } catch (error) {
            if(error.response?.status !== 403) message.error("Lỗi tải danh sách học phí");
        }
        setLoading(false);
    }

    useEffect(() => { fetchInvoices(); }, []);

    const openEdit = (record) => {
        setEditingInvoice(record);
        setPaidAmount(record.paid_amount);
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            await axios.put(`/api/invoices/${editingInvoice._id}`, { paid_amount: paidAmount });
            message.success("Cập nhật học phí thành công");
            setIsModalVisible(false);
            fetchInvoices();
        } catch (error) {
            message.error("Lỗi cập nhật");
        }
    };

    const columns = [
        { title: 'Học sinh', dataIndex: ['student_id', 'full_name'], key: 'student_name' },
        { title: 'Lớp', dataIndex: ['class_id', 'name'], key: 'class_name' },
        { title: 'Tổng học phí', dataIndex: 'amount', key: 'amount', render: v => `${v?.toLocaleString() || 0} đ` },
        { title: 'Đã đóng', dataIndex: 'paid_amount', key: 'paid_amount', render: v => `${v?.toLocaleString() || 0} đ` },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: v => {
             const colors = { Unpaid: 'red', Partial: 'orange', Paid: 'green' };
             const text = { Unpaid: 'Chưa đóng', Partial: 'Đóng 1 phần', Paid: 'Đã thanh toán' };
             return <Tag color={colors[v]}>{text[v]}</Tag>;
        }},
        { title: 'Hành động', key: 'action', render: (_, record) => (
             <Button type="primary" onClick={() => openEdit(record)}>Thu Tiền</Button>
        )}
    ];

    return (
        <div className="font-sans relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Khoản Thu (Học Phí)</h2>
            <Table columns={columns} dataSource={invoices} rowKey="_id" loading={loading} className="shadow-sm rounded-lg" />

            <Modal title="Thanh Toán Học Phí" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleSave}>
               <p>Học sinh: <b>{editingInvoice?.student_id?.full_name}</b></p>
               <p>Tổng tiền phải đóng: <b>{editingInvoice?.amount?.toLocaleString()} đ</b></p>
               <div className="mt-4">
                  <label className="block mb-2 font-medium">Số tiền thực đóng:</label>
                  <InputNumber style={{width: '100%'}} value={paidAmount} onChange={setPaidAmount} min={0} max={editingInvoice?.amount} size="large" />
               </div>
            </Modal>
        </div>
    );
};
export default TuitionManagement;
