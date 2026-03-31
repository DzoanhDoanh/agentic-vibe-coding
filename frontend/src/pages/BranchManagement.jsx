import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [search, setSearch] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountBranch, setAccountBranch] = useState(null);
  const [form] = Form.useForm();
  const [accountForm] = Form.useForm();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/branches");
      setBranches(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = branches.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(b.name || "")
        .toLowerCase()
        .includes(q) ||
      String(b.address || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const handleSubmit = async (values) => {
    try {
      if (editingBranch) {
        await axios.put(`/api/branches/${editingBranch._id}`, values);
        message.success("Cập nhật chi nhánh thành công");
      } else {
        await axios.post("/api/branches", values);
        message.success("Thêm chi nhánh thành công");
      }
      setIsModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
      fetchBranches();
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (record) => {
    setEditingBranch(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/branches/${id}`);
      message.success("Đã xóa chi nhánh");
      fetchBranches();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa!");
    }
  };

  const openCreateBranchAdmin = (branch) => {
    setAccountBranch(branch);
    accountForm.resetFields();
    setAccountModalOpen(true);
  };

  const handleCreateBranchAdmin = async (values) => {
    try {
      await axios.post("/api/users", {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: "BranchAdmin",
        branch_id: accountBranch?._id,
      });
      message.success("Tạo Branch Admin thành công");
      setAccountModalOpen(false);
      setAccountBranch(null);
      accountForm.resetFields();
      fetchBranches();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi tạo tài khoản");
    }
  };

  const columns = [
    {
      title: "Tên Cơ sở",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Điện thoại",
      dataIndex: "contact_phone",
      key: "contact_phone",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Tài khoản chủ chi nhánh",
      key: "branch_admin",
      render: (_, record) => {
        const admin = record.branch_admin;
        if (!admin) return <Tag>Chưa có</Tag>;
        return (
          <div>
            <div style={{ fontWeight: 600 }}>
              {admin.full_name || "Branch Admin"}
            </div>
            <div style={{ color: "#666" }}>{admin.email}</div>
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="default"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            disabled={!!record.branch_admin}
            onClick={() => openCreateBranchAdmin(record)}
          >
            {record.branch_admin ? "Đã có Branch Admin" : "Tạo Branch Admin"}
          </Button>
          <Popconfirm
            title="Xóa chi nhánh?"
            onConfirm={() => handleDelete(record._id)}
          >
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
        }}
      >
        <h2>Danh sách Cơ sở (Chi nhánh)</h2>
        <Space>
          <Input.Search
            placeholder="Tìm theo tên/địa chỉ"
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBranch(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm Cơ sở Mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredBranches}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBranch ? "Cập nhật Chi nhánh" : "Thêm Chi nhánh mới"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBranch(null);
          form.resetFields();
        }}
        okText="Lưu lại"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên chi nhánh"
            rules={[
              { required: true, message: "Vui lòng nhập tên chi nhánh!" },
            ]}
          >
            <Input placeholder="VD: Chi nhánh Cầu Giấy" size="large" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input placeholder="VD: 123 Cầu Giấy, Hà Nội" size="large" />
          </Form.Item>

          <Form.Item name="contact_phone" label="Số liên lạc">
            <Input placeholder="Số điện thoại" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          accountBranch
            ? `Tạo Branch Admin - ${accountBranch.name}`
            : "Tạo Branch Admin"
        }
        open={accountModalOpen}
        onOk={() => accountForm.submit()}
        onCancel={() => {
          setAccountModalOpen(false);
          setAccountBranch(null);
          accountForm.resetFields();
        }}
        okText="Tạo"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={accountForm}
          layout="vertical"
          onFinish={handleCreateBranchAdmin}
        >
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input size="large" placeholder="Admin Chi Nhánh" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input size="large" placeholder="branch_admin@system.com" />
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

export default BranchManagement;
