import React, { useContext, useState } from "react";
import { Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  BarChartOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  ];

  if (user?.role === "SuperAdmin") {
    menuItems.push({ key: "/branches", icon: <BankOutlined />, label: "Quản lý Chi nhánh" });
    menuItems.push({ key: "/teachers", icon: <UserOutlined />, label: "Giáo viên" });
    menuItems.push({ key: "/classes", icon: <BookOutlined />, label: "Lớp học" });
    menuItems.push({ key: "/students", icon: <TeamOutlined />, label: "Học sinh" });
    menuItems.push({ key: "/tuitions", icon: <DollarOutlined />, label: "Thu Học phí" });
    menuItems.push({ key: "/payroll", icon: <BarChartOutlined />, label: "Lương GV" });
    menuItems.push({ key: "/users", icon: <UsergroupAddOutlined />, label: "Người dùng" });
    menuItems.push({ key: "/settings", icon: <SettingOutlined />, label: "Cài đặt" });
  }
  if (user?.role === "BranchAdmin") {
    menuItems.push({ key: "/teachers", icon: <UserOutlined />, label: "Giáo viên" });
    menuItems.push({ key: "/classes", icon: <BookOutlined />, label: "Lớp học" });
    menuItems.push({ key: "/students", icon: <TeamOutlined />, label: "Học sinh" });
    menuItems.push({ key: "/tuitions", icon: <DollarOutlined />, label: "Thu Học phí" });
    menuItems.push({ key: "/payroll", icon: <BarChartOutlined />, label: "Bảng lương" });
    menuItems.push({ key: "/users", icon: <UsergroupAddOutlined />, label: "Người dùng" });
    menuItems.push({ key: "/settings", icon: <SettingOutlined />, label: "Cài đặt" });
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
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col shadow-sm z-10 hidden md:flex`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <span className={`font-bold text-blue-600 truncate transition-all ${collapsed ? 'text-sm' : 'text-xl'}`}>
            {collapsed ? 'MVP' : 'MVPTutoring'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            className="border-none bg-transparent"
            inlineCollapsed={collapsed}
          />
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-center">
          <Button type="text" onClick={() => setCollapsed(!collapsed)} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} className="text-gray-500 hover:text-blue-600" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white/70 backdrop-blur-md border-b border-gray-200 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 m-0 hidden sm:block">
              {menuItems.find(m => m.key === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 hidden sm:block">
              Xin chào, <span className="text-blue-600">{user?.full_name}</span> ({user?.role})
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="rounded-lg shadow-sm"
            >
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
