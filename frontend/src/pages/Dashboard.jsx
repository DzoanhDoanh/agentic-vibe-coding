import React, { useContext, useEffect, useMemo, useState } from "react";
import { Typography, Card, Row, Col, Statistic, Select, message } from "antd";
import { AuthContext } from "../context/AuthContext";
import { TeamOutlined, BookOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
  });
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const branchOptions = useMemo(() => {
    return [
      { label: "Toàn hệ thống", value: "" },
      ...branches.map((b) => ({ label: b.name, value: b._id })),
    ];
  }, [branches]);

  const fetchSummary = async (bId) => {
    try {
      const { data } = await axios.get("/api/dashboard/summary", {
        params: bId ? { branch_id: bId } : {},
      });
      setSummary(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tải thống kê");
    }
  };

  const fetchBranches = async () => {
    if (user?.role !== "SuperAdmin") return;
    try {
      const { data } = await axios.get("/api/branches");
      setBranches(data);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user?.role]);

  useEffect(() => {
    fetchSummary(branchId);
  }, [branchId, user?._id]);

  return (
    <div>
      <Title level={3}>Tổng quan Hệ thống</Title>
      <Paragraph>
        Chào mừng bạn quay trở lại nền tảng quản lý vận hành.
      </Paragraph>

      {user?.role === "SuperAdmin" && (
        <div style={{ maxWidth: 320, marginTop: 12 }}>
          <Select
            value={branchId}
            onChange={setBranchId}
            options={branchOptions}
            style={{ width: "100%" }}
            placeholder="Chọn chi nhánh"
          />
        </div>
      )}

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#f0f5ff" }}>
            <Statistic
              title="Tổng học sinh"
              value={summary.students || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#f6ffed" }}>
            <Statistic
              title="Tổng lớp học"
              value={summary.classes || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ background: "#fff7e6" }}>
            <Statistic
              title="Tổng giáo viên"
              value={summary.teachers || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
