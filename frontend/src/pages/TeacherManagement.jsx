import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/users", {
        params: { role: "Teacher" },
      });
      setTeachers(data);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Lỗi tải danh sách giáo viên",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        String(t.full_name || "")
          .toLowerCase()
          .includes(q) ||
        String(t.email || "")
          .toLowerCase()
          .includes(q),
    );
  }, [teachers, search]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      full_name: record.full_name,
      status: record.status,
      password: "",
    });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await axios.put(`/api/users/${editing._id}`, {
          full_name: values.full_name,
          status: values.status,
          ...(values.password ? { password: values.password } : {}),
        });
        message.success("Cập nhật giáo viên thành công");
      } else {
        await axios.post("/api/users", {
          email: values.email,
          password: values.password,
          full_name: values.full_name,
          role: "Teacher",
        });
        message.success("Tạo giáo viên thành công");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
      fetchTeachers();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const onDelete = async (record) => {
    try {
      await axios.delete(`/api/users/${record._id}`);
      message.success("Đã xóa");
      fetchTeachers();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        <Tag color={v === "Active" ? "green" : "red"}>
          {v === "Active" ? "Hoạt động" : "Vô hiệu"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm title="Xóa giáo viên?" onConfirm={() => onDelete(record)}>
            <Button icon={<DeleteOutlined />} danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2>Quản lý Giáo viên</h2>
        <Space>
          <Input.Search
            placeholder="Tìm theo tên/email"
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm Giáo viên
          </Button>
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
        title={editing ? "Cập nhật Giáo viên" : "Thêm Giáo viên"}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {!editing && (
            <>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Vui lòng nhập email" }]}
              >
                <Input size="large" placeholder="teacher@system.com" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password size="large" placeholder="******" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input size="large" placeholder="Giáo viên A" />
          </Form.Item>

          {editing && (
            <Form.Item name="password" label="Đổi mật khẩu (tuỳ chọn)">
              <Input.Password
                size="large"
                placeholder="Để trống nếu không đổi"
              />
            </Form.Item>
          )}

          <Form.Item name="status" label="Trạng thái" initialValue="Active">
            <Select
              size="large"
              options={[
                { label: "Hoạt động", value: "Active" },
                { label: "Vô hiệu", value: "Inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
