import React, { useContext } from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  ];

  if (user?.role === "SuperAdmin") {
    menuItems.push({
      key: "/branches",
      icon: <BankOutlined />,
      label: "Quản lý Chi nhánh",
    });
  }
  if (user?.role === "BranchAdmin") {
    menuItems.push({
      key: "/teachers",
      icon: <UserOutlined />,
      label: "Giáo viên",
    });
    menuItems.push({
      key: "/classes",
      icon: <BookOutlined />,
      label: "Lớp học",
    });
    menuItems.push({
      key: "/students",
      icon: <TeamOutlined />,
      label: "Học sinh",
    });
  }

  if (user?.role === "Teacher") {
    menuItems.push({
      key: "/classes",
      icon: <BookOutlined />,
      label: "Lớp Của Tôi",
    });
    menuItems.push({
      key: "/schedule",
      icon: <DashboardOutlined />,
      label: "Lịch Dạy",
    });
  }

  if (user?.role === "Student") {
    menuItems.push({
      key: "/schedule",
      icon: <DashboardOutlined />,
      label: "Lịch Học",
    });
    menuItems.push({
      key: "/results",
      icon: <BookOutlined />,
      label: "Kết quả",
    });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark">
        <div
          style={{
            padding: "16px",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          MVPTutoring
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            Xin chào, {user?.full_name} ({user?.role})
          </div>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
            borderRadius: "8px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
