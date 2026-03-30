import React, { useEffect, useMemo, useState } from "react";
import { Input, Table, Tag, Typography, message } from "antd";
import axios from "axios";

const { Title } = Typography;

const StudentResults = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/attendance/student/my");
      setRecords(data);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tải kết quả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      String(r.class_id?.name || "")
        .toLowerCase()
        .includes(q),
    );
  }, [records, search]);

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      title: "Lớp",
      dataIndex: ["class_id", "name"],
      key: "class",
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const color =
          v === "Present" ? "green" : v === "Late" ? "orange" : "red";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      render: (v) => (v === null || v === undefined ? "-" : v),
    },
    {
      title: "Nhận xét",
      dataIndex: "remarks",
      key: "remarks",
      render: (v) => v || "-",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Kết quả học tập
        </Title>
        <Input.Search
          placeholder="Tìm theo tên lớp"
          allowClear
          style={{ width: 260 }}
          onSearch={setSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default StudentResults;
