import React, { useContext, useEffect, useMemo, useState } from "react";
import { Select, message } from "antd";
import { AuthContext } from "../context/AuthContext";
import { TeamOutlined, BookOutlined, RiseOutlined } from "@ant-design/icons";
import axios from "axios";

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
      if(error.response?.status !== 403) message.error(error.response?.data?.message || "Lỗi tải thống kê");
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
    <div className="font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan Hệ thống</h1>
        <p className="text-gray-500">
          Chào mừng bạn quay trở lại nền tảng quản lý vận hành. Hôm nay là một ngày tuyệt vời để theo dõi tiến độ!
        </p>
      </div>

      {user?.role === "SuperAdmin" && (
        <div className="mb-8 max-w-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Xem báo cáo theo chi nhánh:</label>
          <Select
            value={branchId}
            onChange={setBranchId}
            options={branchOptions}
            className="w-full"
            size="large"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 text-blue-500/10 group-hover:scale-110 transition-transform">
             <TeamOutlined style={{ fontSize: '120px' }} />
          </div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-2xl shadow-inner">
                <TeamOutlined />
             </div>
             <h3 className="text-lg font-semibold text-gray-700 m-0">Học sinh</h3>
          </div>
          <div className="flex items-baseline gap-2 mt-4 relative z-10">
            <span className="text-4xl font-bold text-gray-900">{summary.students || 0}</span>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">+12% tháng này</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform">
             <BookOutlined style={{ fontSize: '120px' }} />
          </div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-inner">
                <BookOutlined />
             </div>
             <h3 className="text-lg font-semibold text-gray-700 m-0">Lớp học mở</h3>
          </div>
          <div className="flex items-baseline gap-2 mt-4 relative z-10">
            <span className="text-4xl font-bold text-gray-900">{summary.classes || 0}</span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Đang vận hành</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6 border border-violet-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 text-violet-500/10 group-hover:scale-110 transition-transform">
             <RiseOutlined style={{ fontSize: '120px' }} />
          </div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center text-2xl shadow-inner">
                <TeamOutlined />
             </div>
             <h3 className="text-lg font-semibold text-gray-700 m-0">Giáo viên</h3>
          </div>
          <div className="flex items-baseline gap-2 mt-4 relative z-10">
            <span className="text-4xl font-bold text-gray-900">{summary.teachers || 0}</span>
            <span className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Nhân sự</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
