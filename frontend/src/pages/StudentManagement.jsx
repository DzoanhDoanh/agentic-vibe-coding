import React, { useMemo, useState, useEffect } from "react";
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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountStudent, setAccountStudent] = useState(null);
  const [form] = Form.useForm();
  const [accountForm] = Form.useForm();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/students");
      setStudents((prev) => {
        const prevById = new Map((prev || []).map((s) => [String(s._id), s]));
        return (data || []).map((s) => {
          const prevRow = prevById.get(String(s._id));
          // If backend hasn't been restarted, it may not include the 'account' field at all.
          // In that case, keep any locally-known account to avoid showing "Chưa có" again.
          const mergedAccount = Object.prototype.hasOwnProperty.call(
            s,
            "account",
          )
            ? s.account
            : (prevRow?.account ?? null);
          return { ...s, account: mergedAccount };
        });
      });
    } catch (error) {
      if (error.response?.status !== 403) message.error("Lỗi tải học sinh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        String(s.full_name || "")
          .toLowerCase()
          .includes(q) ||
        String(s.phone || "")
          .toLowerCase()
          .includes(q),
    );
  }, [students, search]);

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await axios.put(`/api/students/${editing._id}`, values);
        message.success("Cập nhật học sinh thành công");
      } else {
        await axios.post("/api/students", values);
        message.success("Thêm học sinh thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditing(null);
      fetchStudents();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      full_name: record.full_name,
      parent_name: record.parent_name,
      phone: record.phone,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/students/${record._id}`);
      message.success("Đã xóa");
      fetchStudents();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const openCreateStudentAccount = (student) => {
    setAccountStudent(student);
    accountForm.resetFields();
    setAccountModalOpen(true);
  };

  const handleCreateStudentAccount = async (values) => {
    try {
      const { data } = await axios.post("/api/users", {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: "Student",
        student_id: accountStudent?._id,
      });

      if (data?._id && data?.student_id) {
        setStudents((prev) =>
          (prev || []).map((s) =>
            String(s._id) === String(data.student_id)
              ? {
                  ...s,
                  account: {
                    _id: data._id,
                    email: data.email,
                    full_name: data.full_name,
                    status: data.status,
                    student_id: data.student_id,
                  },
                }
              : s,
          ),
        );
      }

      message.success("Tạo tài khoản học sinh thành công");
      setAccountModalOpen(false);
      setAccountStudent(null);
      accountForm.resetFields();
      fetchStudents();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tạo tài khoản");
    }
  };

  const columns = [
    { title: "Tên Học sinh", dataIndex: "full_name", key: "full_name" },
    { title: "Phụ huynh", dataIndex: "parent_name", key: "parent_name" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Tài khoản",
      key: "account",
      render: (_, record) => {
        if (!record.account) return <Tag>Chưa có</Tag>;
        return <span>{record.account.email}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) =>
        v === "Studying" ? (
          <Tag color="green">Đang học</Tag>
        ) : v === "Reserved" ? (
          <Tag color="orange">Bảo lưu</Tag>
        ) : v === "Dropped" ? (
          <Tag color="red">Đã nghỉ</Tag>
        ) : (
          v
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            size="small"
            disabled={!!record.account}
            onClick={() => openCreateStudentAccount(record)}
          >
            {record.account ? "Đã có tài khoản" : "Tạo tài khoản"}
          </Button>
          <Popconfirm
            title="Xóa học sinh?"
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger>
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
        }}
      >
        <h2>Danh sách Học sinh</h2>
        <Space>
          <Input.Search
            placeholder="Tìm theo tên/SĐT"
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm Học sinh
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
        title={editing ? "Cập nhật Học sinh" : "Thêm Học sinh"}
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
          <Form.Item
            name="full_name"
            label="Tên Học Sinh"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="parent_name" label="Tên Phụ Huynh">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="phone" label="Số Điện Thoại">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Studying">
            <Select
              size="large"
              options={[
                { label: "Đang học", value: "Studying" },
                { label: "Bảo lưu", value: "Reserved" },
                { label: "Đã nghỉ", value: "Dropped" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          accountStudent
            ? `Tạo tài khoản - ${accountStudent.full_name}`
            : "Tạo tài khoản học sinh"
        }
        open={accountModalOpen}
        onOk={() => accountForm.submit()}
        onCancel={() => {
          setAccountModalOpen(false);
          setAccountStudent(null);
          accountForm.resetFields();
        }}
        destroyOnClose
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form
          form={accountForm}
          layout="vertical"
          onFinish={handleCreateStudentAccount}
        >
          <Form.Item
            name="full_name"
            label="Họ tên hiển thị"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input
              size="large"
              placeholder={accountStudent?.full_name || "Học sinh"}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input size="large" placeholder="student@system.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password size="large" placeholder="******" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default StudentManagement;
