import React, { useMemo, useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Select,
  Tag,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import axios from "axios";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollClass, setEnrollClass] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [enrollForm] = Form.useForm();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/classes");
      setClasses(data);
    } catch (error) {
      if (error.response?.status !== 403) message.error("Lỗi tải dữ liệu lớp");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await axios.get("/api/users", {
        params: { role: "Teacher" },
      });
      setTeachers(data);
    } catch (error) {
      // ignore
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get("/api/students");
      setStudents(data);
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) =>
      String(c.name || "")
        .toLowerCase()
        .includes(q),
    );
  }, [classes, search]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      teacher_id: record.teacher_id?._id || record.teacher_id || undefined,
      status: record.status,
      days: record.schedule_days || [],
      timeRange: record.start_time && record.end_time ? [dayjs(record.start_time, "HH:mm"), dayjs(record.end_time, "HH:mm")] : null
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const { days, timeRange, ...rest } = values;
      let schedule_rule = "";
      if (days && days.length > 0 && timeRange && timeRange.length === 2) {
        schedule_rule = `${days.join("-")}, ${timeRange[0].format("HH:mm")}-${timeRange[1].format("HH:mm")}`;
      }
      const submitData = { ...rest, schedule_rule };

      if (editing) {
        await axios.put(`/api/classes/${editing._id}`, submitData);
        message.success("Cập nhật lớp thành công");
      } else {
        await axios.post("/api/classes", submitData);
        message.success("Thêm lớp thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditing(null);
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi thêm lớp");
    }
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/classes/${record._id}`);
      message.success("Đã xóa");
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const openEnroll = (record) => {
    setEnrollClass(record);
    setSelectedStudentIds([]);
    enrollForm.resetFields();
    setEnrollModalOpen(true);
  };

  const handleEnroll = async () => {
    if (!enrollClass) return;
    if (selectedStudentIds.length === 0) {
      message.warning("Chọn ít nhất 1 học sinh");
      return;
    }
    try {
      for (const sid of selectedStudentIds) {
        await axios.post(`/api/classes/${enrollClass._id}/enroll`, {
          student_id: sid,
        });
      }
      message.success("Ghi danh thành công");
      setEnrollModalOpen(false);
      setEnrollClass(null);
      setSelectedStudentIds([]);
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi ghi danh");
    }
  };

  const columns = [
    { title: "Tên Lớp", dataIndex: "name", key: "name" },
    {
      title: "Giáo viên",
      dataIndex: "teacher_id",
      key: "teacher_id",
      render: (t) => (t ? t.full_name : <Tag>Chưa phân công</Tag>),
    },
    { title: "Lịch học", dataIndex: "schedule_rule", key: "schedule_rule" },
    {
      title: "Học sinh",
      key: "students",
      render: (_, record) => {
        const n = (record.enrolled_students || []).length;
        return <span>{n}</span>;
      },
    },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (v) => v === "Open" ? <Tag color="green">Đang mở</Tag> : v === "Closed" ? <Tag color="red">Đã đóng</Tag> : v },
    ...(user?.role !== "Teacher" ? [{
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<UserAddOutlined />}
            size="small"
            onClick={() => openEnroll(record)}
          >
            Ghi danh
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa lớp?" onConfirm={() => handleDelete(record)}>
            <Button icon={<DeleteOutlined />} danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý Lớp học</h2>
        <Space>
          <Input.Search
            placeholder="Tìm theo tên lớp"
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          {user?.role !== "Teacher" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm Lớp
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Cập nhật Lớp" : "Thêm Lớp"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditing(null);
          form.resetFields();
        }}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên lớp" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="teacher_id" label="Giáo viên (tuỳ chọn)">
            <Select
              size="large"
              allowClear
              options={teachers.map((t) => ({
                label: `${t.full_name} (${t.email})`,
                value: t._id,
              }))}
              placeholder="Chọn giáo viên"
            />
          </Form.Item>
          <Form.Item name="days" label="Các ngày học trong tuần" rules={[{ required: true, message: "Chọn ít nhất 1 ngày" }]}>
            <Select mode="multiple" placeholder="Chọn ngày" size="large">
              <Select.Option value="T2">Thứ 2</Select.Option>
              <Select.Option value="T3">Thứ 3</Select.Option>
              <Select.Option value="T4">Thứ 4</Select.Option>
              <Select.Option value="T5">Thứ 5</Select.Option>
              <Select.Option value="T6">Thứ 6</Select.Option>
              <Select.Option value="T7">Thứ 7</Select.Option>
              <Select.Option value="CN">Chủ Nhật</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="Khung giờ học" rules={[{ required: true, message: "Chọn khung giờ" }]}>
            <TimePicker.RangePicker format="HH:mm" size="large" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Open">
            <Select
              size="large"
              options={[
                { label: "Đang mở", value: "Open" },
                { label: "Đã đóng", value: "Closed" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          enrollClass
            ? `Ghi danh học sinh - ${enrollClass.name}`
            : "Ghi danh học sinh"
        }
        open={enrollModalOpen}
        onOk={handleEnroll}
        onCancel={() => {
          setEnrollModalOpen(false);
          setEnrollClass(null);
          setSelectedStudentIds([]);
          enrollForm.resetFields();
        }}
        destroyOnClose
        okText="Ghi danh"
        cancelText="Hủy"
      >
        <Form form={enrollForm} layout="vertical">
          <Form.Item label="Chọn học sinh">
            <Select
              mode="multiple"
              value={selectedStudentIds}
              onChange={setSelectedStudentIds}
              options={students.map((s) => ({
                label: `${s.full_name}${s.phone ? ` - ${s.phone}` : ""}`,
                value: s._id,
              }))}
              placeholder="Chọn học sinh"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default ClassManagement;
