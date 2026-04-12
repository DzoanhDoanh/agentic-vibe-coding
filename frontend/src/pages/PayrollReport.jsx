import React, { useState, useEffect } from 'react';
import { Table, message, Card, Statistic } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const PayrollReport = () => {
    const [payroll, setPayroll] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [payrollRes, teacherRes] = await Promise.all([
               axios.get('/api/attendance/report/payroll'),
               axios.get('/api/users?role=Teacher')
            ]);
            
            const teacherSessions = payrollRes.data || {};
            
            const data = teacherRes.data.map(t => ({
               _id: t._id,
               full_name: t.full_name,
               email: t.email,
               sessions: teacherSessions[t._id] || 0
            }));
            
            setPayroll(data);
        } catch (error) {
            message.error("Lỗi tải báo cáo lương");
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const columns = [
        { title: 'Tên Giáo viên', dataIndex: 'full_name', key: 'full_name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số Ca Đã Dạy', dataIndex: 'sessions', key: 'sessions', render: v => <span className="font-bold text-blue-600">{v} ca</span> },
        { title: 'Lương Tạm Tính (Giả định 200k/ca)', key: 'est_salary', render: (_, r) => `${(r.sessions * 200000).toLocaleString()} đ` }
    ];

    return (
        <div className="font-sans relative">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Báo cáo Lương Giáo Viên</h2>
                <p className="text-gray-500 mt-1">Dựa trên số buổi học đã được điểm danh bởi giáo viên.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="rounded-xl border border-gray-100 shadow-sm bg-blue-50">
                   <Statistic title="Tổng quỹ lương tạm tính" value={payroll.reduce((a, b) => a + (b.sessions * 200000), 0)} suffix="VNĐ" prefix={<DollarOutlined />} />
                </Card>
            </div>

            <Table columns={columns} dataSource={payroll} rowKey="_id" loading={loading} className="shadow-sm rounded-lg" />
        </div>
    );
};
export default PayrollReport;
