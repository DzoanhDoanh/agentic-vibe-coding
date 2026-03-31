[EPIC] Xây dựng MVP Hệ thống quản lý trung tâm 
học thêm đa chi nhánh

1. Bối cảnh & Mục tiêu (Context & Objectives)
Bối cảnh: Cần xây dựng một hệ thống quản lý vận hành cho chuỗi trung tâm học thêm, hỗ trợ mô hình nhiều cơ sở và chi nhánh. Hệ thống yêu cầu xử lý chặt chẽ các quan hệ cơ sở dữ liệu cốt lõi: 1-N (Cơ sở - Chi nhánh) và N-N (Giáo viên - Lớp học, Học sinh - Lớp học).
Mục tiêu huấn luyện (Vibe Code - "Antigravity"): Yêu cầu team áp dụng tối đa các công cụ sinh mã (AI coding assistants, scaffolding, framework capabilities) để đẩy nhanh tốc độ hoàn thiện các module CRUD cơ bản. Tập trung chất xám vào việc xử lý luồng logic phân quyền (RBAC), tính toàn vẹn dữ liệu và thiết kế kiến trúc gọn nhẹ, không viết lại code thủ công (boilerplate) một cách lãng phí.
2. Phạm vi công việc (Scope of Work)
Hệ thống cần thiết lập Role-Based Access Control (RBAC) với 4 phân hệ chính. Yêu cầu hoàn thiện các User Story sau:
2.1. Phân hệ Super Admin (Chủ cơ sở)
Quản lý Chi nhánh: Thực hiện CRUD (Tạo, Đọc, Cập nhật, Xóa) danh sách các chi nhánh.
Quản lý Tài khoản: Cấp phát tài khoản và phân quyền Branch Admin cho từng chi nhánh.
Dashboard: Hiển thị thống kê tổng quan (số lượng học sinh, giáo viên, lớp học) trên toàn hệ thống, có bộ lọc theo từng chi nhánh.
2.2. Phân hệ Branch Admin (Chủ chi nhánh)
Data Isolation (Cách ly dữ liệu): Chỉ được phép truy xuất và thao tác trên dữ liệu thuộc chi nhánh được phân công.
Quản lý Lớp học: CRUD thông tin lớp (Môn học, Thời gian, Phòng học).
Quản lý Nhân sự & Phân công: CRUD hồ sơ giáo viên. Phân công giáo viên vào lớp học. Có logic cảnh báo nếu lịch dạy bị trùng lặp.
Quản lý Học sinh & Ghi danh: CRUD hồ sơ học sinh. Map học sinh vào các lớp học tương ứng (một học sinh có thể học nhiều lớp như Toán, Văn, Anh).
2.3. Phân hệ Teacher (Giáo viên)
Xem Lịch dạy: Hiển thị danh sách lớp và thời khóa biểu cá nhân.
Vận hành Lớp học: Chức năng điểm danh học sinh theo từng buổi học và nhập điểm thi/kiểm tra, nhận xét học sinh.
2.4. Phân hệ Student (Học sinh)
Xem Lịch học: Hiển thị thời khóa biểu cá nhân chi tiết (môn học, phòng học, giáo viên, thời gian).
Tra cứu kết quả: Xem lịch sử điểm danh và điểm số cá nhân.
3. Yêu cầu Giao diện & Trải nghiệm (UI/UX)
Kiến trúc Layout: Sử dụng chuẩn B2B SaaS Dashboard (Sidebar Navigation tĩnh/động theo Role, Topbar).
Thao tác Dữ liệu: Các danh sách phải có Pagination, Search và Filter. Ưu tiên sử dụng Modal/Slide-over panel cho các thao tác Thêm/Sửa để tối ưu hóa flow của người dùng, tránh reload trang.
Hiển thị Lịch: Bắt buộc tích hợp thư viện Calendar để trực quan hóa lịch học và lịch dạy (hiển thị dạng Tuần/Tháng).
Tính đáp ứng:
Phân hệ Super Admin & Branch Admin: Tối ưu cho Desktop (hiển thị bảng dữ liệu nhiều cột).
Phân hệ Teacher & Student: Bắt buộc tối ưu Mobile-first.
4. Tiêu chí Nghiệm thu
Để ticket này được chuyển sang trạng thái "Done", cần thỏa mãn các điều kiện kỹ thuật sau:
1.	Toàn vẹn dữ liệu (Data Integrity): Ràng buộc khóa ngoại (Foreign Keys) hoạt động đúng. VD: Trực tiếp chặn hành động xóa một Lớp học nếu đang có bản ghi Học sinh liên kết với lớp đó.
2.	Bảo mật phân quyền (Security/Authorization): Thực hiện test chéo thành công. Branch Admin A không thể xem, sửa, hoặc xóa dữ liệu của Branch Admin B (ngay cả khi cố tình thay đổi ID/Tham số trên URL hoặc gọi API trực tiếp).
3.	Tối ưu Vibe Code: Source code gọn gàng, thể hiện rõ việc áp dụng "antigravity"/AI để xử lý các tác vụ lặp lại. Thời gian hoàn thành module CRUD phải ngắn gọn hơn mức thông thường.
4.	Kiểm thử luồng chính: Luồng tạo chi nhánh -> tạo lớp -> thêm giáo viên -> thêm học sinh -> điểm danh phải chạy thông suốt không xuất hiện lỗi logic (logical bugs) hoặc lỗi gián đoạn (crash).

