import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ConfigProvider } from "antd";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BranchManagement from "./pages/BranchManagement";
import ClassManagement from "./pages/ClassManagement";
import StudentManagement from "./pages/StudentManagement";
import Schedule_Teacher from "./pages/Schedule_Teacher";
import TeacherManagement from "./pages/TeacherManagement";
import TuitionManagement from "./pages/TuitionManagement";
import PayrollReport from "./pages/PayrollReport";
import UserManagement from "./pages/UserManagement";
import AdminSettings from "./pages/AdminSettings";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const MainApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="schedule" element={<Schedule_Teacher />} />
          <Route path="courses" element={<Navigate to="/settings" replace />} />
          <Route path="rooms" element={<Navigate to="/settings" replace />} />
          <Route path="tuitions" element={<TuitionManagement />} />
          <Route path="payroll" element={<PayrollReport />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6', // Tailwind blue-500
          borderRadius: 8,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
