# Hướng dẫn Vận hành Hệ thống Quản lý Trung tâm (V1.0)

Tài liệu này hướng dẫn quy trình làm việc chuẩn từ khâu thiết lập ban đầu đến khâu vận hành hàng ngày, phân định rõ trách nhiệm của từng vai trò trong hệ thống.

---

## 1. Phân quyền Vai trò (Roles & Permissions)

| Vai trò | Phạm vi quản lý | Các hành động chính |
| :--- | :--- | :--- |
| **SuperAdmin** | Toàn hệ thống | Quản lý chi nhánh, quản lý người dùng (tất cả), xem báo cáo tổng, thiết lập hệ thống (khóa học, phòng học toàn cục). |
| **BranchAdmin** | Chi nhánh cụ thể | Quản lý giáo viên, học sinh, lớp học, thu học phí và xem lương giáo viên trong phạm vi chi nhánh được giao. |
| **Teacher** | Lớp học được phân công | Xem lịch dạy, thực hiện điểm danh học sinh từng buổi học, xem lịch sử dạy. |
| **Student** | Cá nhân | Xem lịch học cá nhân, theo dõi trạng thái đóng học phí. |

---

## 2. Quy trình Vận hành Chuẩn (Workflow)

### Bước 1: Thiết lập nền tảng (Chỉ SuperAdmin)
1. **Quản lý Chi nhánh**: Tạo các cơ sở (ví dụ: Chi nhánh Cầu Giấy, Chi nhánh Long Biên).
2. **Cài đặt -> Khóa học**: Tạo danh mục khóa học và mức học phí tương ứng (ví dụ: Tiếng Anh Giao tiếp - 2.000.000đ).
3. **Cài đặt -> Phòng học**: Khai báo danh sách các phòng học tại từng chi nhánh.

### Bước 2: Quản lý Nhân sự & Tài khoản
1. **Người dùng**: Tạo tài khoản cho nhân viên/giáo viên.
   - Gán vai trò `BranchAdmin` cho quản lý cơ sở.
   - Gán vai trò `Teacher` cho giáo viên.
   - *Tính năng nâng cao*: Có thể **Khóa tài khoản** (Lock) khi nhân viên nghỉ việc hoặc **Đổi mật khẩu** trực tiếp nếu người dùng quên.
2. **Giáo viên**: Trong mục **Giáo viên**, cập nhật thông tin chi tiết và quan trọng nhất là **Lương theo giờ/buổi**. Đây là cơ sở để hệ thống tính lương tự động.

### Bước 3: Quản lý Đào tạo (BranchAdmin)
1. **Lớp học**: Tạo lớp học mới.
   - Chọn Khóa học, Phòng học, Giáo viên.
   - Nhập lịch học theo quy tắc (ví dụ: `T2-T4-T6, 18:00-19:30`).
2. **Học sinh**: Thêm hồ sơ học sinh (Họ tên, SĐT, Ngày sinh). Lưu ý trạng thái:
   - `Đang học`: Học sinh đang tham gia các lớp.
   - `Bảo lưu`: Tạm dừng nhưng vẫn còn trong danh sách.
   - `Nghỉ học`: Đã kết thúc lộ trình tại trung tâm.

### Bước 4: Ghi danh & Tài chính (Phần Quan Trọng)
1. **Ghi danh**: Vào chi tiết lớp học hoặc hồ sơ học sinh để thực hiện ghi danh.
2. **Thu học phí**: 
   - Ngay khi ghi danh, một hóa đơn (Invoice) được tạo tự động với trạng thái **Chưa đóng**.
   - **Thanh toán**: Quản lý có thể nhập số tiền học sinh nộp thực tế.
     - Nếu nộp đủ: Trạng thái chuyển thành **Đã thanh toán**.
     - Nếu nộp một phần: Trạng thái là **Đóng 1 phần**. Hệ thống sẽ theo dõi số dư còn lại.

### Bước 5: Điểm danh & Tính lương
1. **Điểm danh (Giáo viên)**: Bấm vào buổi học trên Calendar. Chọn trạng thái cho từng học sinh.
2. **Lương GV**: Hệ thống sẽ quét toàn bộ dữ liệu điểm danh đã thực hiện (chỉ tính các buổi đã có dữ liệu điểm danh) nhân với mức lương cấu hình trong hồ sơ giáo viên để ra bảng lương cuối tháng.

### Bước 6: Theo dõi Dashboard
- **Tổng học sinh**: Biết được quy mô hiện tại.
- **Doanh thu thực tế**: Chỉ tính những khoản tiền học sinh ĐÃ nộp thực tế (không tính tiền nợ).
- **Lớp học**: Theo dõi số lượng lớp đang vận hành.

---

## 3. Các lưu ý quan trọng và Mẹo vận hành

> [!IMPORTANT]
> - **Lịch học**: Cần nhập đúng định dạng `Thứ, Giờ-Giờ` (ví dụ: `T2-T4, 17:30-19:00`) để hệ thống tính toán lịch tự động.
> - **Điểm danh**: Giáo viên cần điểm danh đúng ngày học. Nếu điểm danh muộn, dữ liệu vẫn được lưu nhưng cần chú ý ngày tháng để bảng lương chính xác.
> - **Chế độ xem**: 
>   - Calendar có thể xem theo **Tháng**, **Tuần**, hoặc **Ngày**. 
>   - Giáo viên nên dùng chế độ xem **Tuần** để dễ dàng quản lý lịch dạy.

---

Tài liệu này được tạo vào: 12/04/2026.
Phát triển bởi: **Antigravity AI**.
