# Implementation Plan — MVP Hệ thống quản lý trung tâm học thêm đa chi nhánh

> Tài liệu này mô tả phạm vi MVP, kiến trúc, các module cần có, checklist triển khai theo phase và trạng thái hiện tại của dự án.

## 1) Mục tiêu

- Quản lý trung tâm học thêm nhiều chi nhánh (Branch)
- Phân quyền theo vai trò (RBAC) + cô lập dữ liệu theo chi nhánh (Branch Isolation)
- Các luồng chính: tạo chi nhánh → tạo giáo viên/học sinh → tạo lớp + lịch học → ghi danh → điểm danh + điểm → học sinh xem kết quả

## 2) Vai trò & quyền hạn (RBAC)

- **SuperAdmin**
  - Quản lý chi nhánh
  - Xem tổng quan toàn hệ thống
- **BranchAdmin**
  - Quản lý dữ liệu trong chi nhánh của mình: giáo viên, học sinh, lớp
- **Teacher**
  - Xem lịch dạy của mình
  - Điểm danh lớp mình phụ trách (kèm điểm/nhận xét)
- **Student**
  - Xem lịch học của mình
  - Xem lịch sử điểm danh/điểm

## 3) Nguyên tắc cô lập dữ liệu theo chi nhánh

- Mọi tài nguyên có `branch_id` (User/Class/Student/...) phải bị giới hạn theo `branch_id` của user đang đăng nhập (trừ SuperAdmin).
- BranchAdmin không được truy cập/chỉnh sửa dữ liệu của chi nhánh khác.

## 4) Kiến trúc tổng quan

- **Backend**: Node.js + Express + MongoDB (Mongoose), JWT auth
- **Frontend**: React + Vite + Ant Design, Axios, React Router
- **API prefix**: `/api/*`

## 5) Phạm vi module (Backend APIs)

> Dưới đây là checklist logic/module. Tên endpoint có thể xem trong folder `backend/routes/`.

### 5.1 Auth

- [x] Đăng nhập (JWT)
- [x] Normalize email (trim/lowercase) để tránh sai lệch khi seed/đăng nhập
- [x] Middleware `protect` + `authorize`

### 5.2 Branch

- [x] CRUD chi nhánh (SuperAdmin)
- [x] Ràng buộc toàn vẹn: không cho xoá Branch nếu còn Class/Student/User liên kết

### 5.3 User / Teacher / Student accounts

- [x] CRUD User theo role (SuperAdmin/BranchAdmin)
- [x] Tạo Teacher account thuộc chi nhánh
- [x] Tạo Student account gắn với `student_id`
- [x] Ràng buộc toàn vẹn: không cho xoá Teacher nếu đang được gán cho lớp đang mở (hoặc có ràng buộc tương đương)

### 5.4 Student (profile)

- [x] CRUD Student profile trong chi nhánh
- [x] Ràng buộc toàn vẹn: không cho xoá Student nếu đang ghi danh lớp

### 5.5 Class + Enrollment

- [x] CRUD Class trong chi nhánh
- [x] Assign teacher
- [x] Enroll/Unenroll học sinh
- [x] Ràng buộc toàn vẹn: không cho xoá Class nếu còn học sinh ghi danh

### 5.6 Schedule (lịch học)

- [x] Parse `schedule_rule` (ví dụ `T2, 18:00-19:30`) → sinh trường dẫn xuất (`schedule_days`, `start_time`, `end_time`)
- [x] Teacher schedule conflict detection khi tạo/sửa lớp
- [x] Endpoint xem lớp của Teacher
- [x] Endpoint xem lớp của Student

### 5.7 Attendance + Score

- [x] Lấy điểm danh theo lớp + ngày
- [x] Upsert điểm danh theo lớp/ngày/học sinh
- [x] Hỗ trợ `score` (điểm) + `remarks`
- [x] Student xem lịch sử điểm danh/điểm của mình

### 5.8 Dashboard

- [x] Dashboard summary (SuperAdmin toàn hệ thống, BranchAdmin theo chi nhánh)

## 6) Phạm vi màn hình (Frontend)

- [x] Login
- [x] Dashboard (đọc API summary; SuperAdmin có thể lọc theo Branch)
- [x] Branch Management (SuperAdmin)
- [x] Teacher Management (BranchAdmin)
- [x] Student Management (BranchAdmin)
- [x] Class Management (BranchAdmin): CRUD + gán giáo viên + ghi danh học sinh
- [x] Schedule (Teacher/Student): hiển thị lịch từ API
- [x] Teacher Attendance modal: điểm danh + điểm
- [x] Student Results: xem lịch sử điểm danh/điểm

## 7) Ràng buộc dữ liệu (Data integrity rules)

- [x] Không xoá Branch nếu còn dữ liệu liên kết
- [x] Không xoá Class nếu còn học sinh ghi danh
- [x] Không xoá Student nếu đang ghi danh lớp
- [x] Không xoá Teacher nếu đang phụ trách lớp (theo rule hiện tại)

## 8) Dev setup / chạy dự án (hiện tại)

### 8.1 Yêu cầu

- Node.js (LTS khuyến nghị)
- MongoDB (local hoặc remote)

### 8.2 Backend

- Cài deps:
  - `cd backend`
  - `npm install`
- Tạo file `.env` (tự tạo thủ công vì hiện chưa có mẫu):
  - `MONGO_URI=mongodb://localhost:27017/tutoring_center`
  - `JWT_SECRET=your_secret`
  - `PORT=5000`
- Seed dữ liệu:
  - `node seeder.js`
- Chạy server:
  - `node server.js`

### 8.3 Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

### 8.4 Ghi chú vận hành

- Tránh chạy **nhiều instance backend** cùng lúc (dễ gọi nhầm instance cũ → lỗi “Cannot GET/POST ...”).

## 9) Kiểm thử luồng chính (Smoke test)

- [x] BranchAdmin login → tạo Student → tạo Student user → tạo Teacher → tạo Class → enroll → Teacher điểm danh + điểm → Student login xem kết quả

## 10) Portability / chạy trên máy khác (còn lại)

> Đây là phần “đóng gói tài liệu & script” để người khác clone về chạy nhanh.

- [x] Không commit `node_modules` lên git (đã có rule trong `.gitignore` ở root)
- [ ] Tạo `backend/.env.example` để người khác copy nhanh thành `.env`
- [ ] Bổ sung scripts trong `backend/package.json`:
  - `start`: `node server.js`
  - `seed`: `node seeder.js`
- [ ] Viết README root hướng dẫn chạy (Windows/macOS/Linux) + lưu ý MongoDB

---

## Phụ lục A — Nơi tra cứu nhanh

- Backend routes: `backend/routes/`
- Backend controllers: `backend/controllers/`
- Frontend pages: `frontend/src/pages/`
- Layout/menus theo role: `frontend/src/components/layout/`
