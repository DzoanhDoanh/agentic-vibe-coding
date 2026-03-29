import React, { useContext } from 'react';
import { Typography, Card, Row, Col, Statistic } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { TeamOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Title level={3}>Tổng quan Hệ thống</Title>
      <Paragraph>Chào mừng bạn quay trở lại nền tảng quản lý vận hành.</Paragraph>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f0f5ff' }}>
            <Statistic title="Tổng sinh viên" value={0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Lớp học đang mở" value={0} prefix={<BookOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
