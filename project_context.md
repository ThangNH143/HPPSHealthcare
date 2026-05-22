# Tên Dự Án: Hệ Thống Quản Lý Nhân Sự & Tiền Lương Y Tế (Healthcare HR & Payroll System)
## Kiến Trúc Hệ Thống:

**Frontend (Giao diện):** ReactJS (Tương tác người dùng mượt mà, quản lý state độc lập).
**Backend (Máy chủ xử lý):** Node.js (Xử lý logic nghiệp vụ, API, bảo mật).
**Database (Cơ sở dữ liệu):** SQL Server.
**Mục Tiêu Cốt Lõi:** Quản lý vòng đời nhân sự, xếp lịch - chấm công tự động, tính lương - thưởng KPI, quản lý chứng chỉ (CCHN/CME) và cổng thông tin Self-Service.

# 1. TIÊU CHUẨN LẬP TRÌNH & BẢO TRÌ (CODING & MAINTENANCE STANDARDS)
(Nguyên tắc bắt buộc áp dụng cho mọi đoạn code được sinh ra trong dự án này)
**Kiến trúc tách biệt (Decoupled):** Ranh giới API giữa Node.js và ReactJS phải rõ ràng, khai báo chuẩn hợp đồng dữ liệu (API Contract).
**Ghi chú & Giải thích (Clean Code):** Mọi module phức tạp (như tính thuế, chốt công, mã hóa) bắt buộc phải có comment giải thích luồng logic. Code phải dễ đọc, dễ bảo trì cho các lập trình viên tiếp quản sau 5-10 năm.
**Tái sử dụng (Reusability):** Ưu tiên xây dựng các React Component dùng chung (VD: Bảng biểu, Dropdown chọn nhân viên) để tối ưu chi phí bảo trì.

# 2. NGUYÊN TẮC BẢO MẬT & QUẢN LÝ TÀI KHOẢN (SECURITY CORE)
**Zero-Trust Architecture:** Mọi request đều phải validate (Zod/Joi), mọi dữ liệu đều phải kiểm duyệt trước khi lưu.
**Quản Lý Tài Khoản & RBAC:** Phân quyền tới mức **"cấp trường dữ liệu"** (Field-level Security).
**Quản Lý Phiên (Session Timeout):** Tự động Force Logout sau 10 phút idle để bảo vệ máy tính dùng chung tại khoa/phòng.
**Bảo Vệ Dữ Liệu:** Chống XSS (DOMPurify), Mã hóa nhạy cảm mức AES-256 (Tài khoản ngân hàng, Tổng lương).
**Audit Logging:** Dùng Temporal Tables của SQL Server để lưu vết mọi thay đổi (Ai sửa, lúc nào, giá trị cũ/mới).

# 3. LỘ TRÌNH TRIỂN KHAI THEO PHA (PHASED IMPLEMENTATION)
**Phase 1 (Core HR, Credentials & Portal):** Khung bảo mật, Hồ sơ NS, Vị trí việc làm, Quản lý CCHN/CME, Offboarding (Tài sản) và Cổng thông tin nhân viên (ESS).
**Phase 2 (Smart Rostering & T&A):** Xếp lịch trực thông minh, quy trình xin/duyệt nghỉ phép, và chốt công 3 cấp.
**Phase 3 (Payroll, KPI & Tax):** Đánh giá hiệu suất (KPI), tính lương động, phụ cấp tiền ăn trực, thuế TNCN và chốt lương.
**Phase 4 (Integrations & Reporting):** Import dữ liệu HIS, gửi Email tự động và xuất báo cáo chuẩn.

# 4. QUẢN LÝ VÒNG ĐỜI NHÂN SỰ & CỔNG THÔNG TIN (HR & ESS)
**Cổng Thông Tin Nhân Viên (ESS/MSS):** Giao diện ReactJS cho phép nhân viên tự xem phiếu lương, lịch trực, chứng chỉ CME, tự đăng ký nghỉ phép/đổi ca.
**Quản Lý CCHN & Đào Tạo Liên Tục (CME):** Ghi nhận chứng chỉ. Cron-job tự động cảnh báo khi sắp hết hạn CCHN hoặc thiếu tiết CME.
**Quản Lý Thực Hành Sinh (Interns):** Hồ sơ riêng cho sinh viên/bác sĩ thực hành (9-18 tháng), quản lý lịch luân khoa và Bác sĩ hướng dẫn (Mentor).
**Quy Trình Nghỉ Việc (Offboarding):** Quản lý bàn giao. Tự động check nợ tài sản/đồng phục để quyết định cho phép chốt lương tháng cuối.
**Quản Lý Vị Trí Việc Làm:** Gán vị trí và ghi nhận mốc thời gian (ValidFrom - ValidTo) tại từng Khoa/Phòng để tính chính xác tỷ lệ phụ cấp.

# 5. PHÂN HỆ XẾP LỊCH, CHẤM CÔNG & CA TRỰC (ROSTERING & T&A)
**Xếp Lịch Trực Thông Minh (Smart Rostering):** Giao diện kéo-thả (Drag & Drop) xếp lịch. Tích hợp Rule Engine cảnh báo vi phạm (VD: Không xếp 2 ca 24h liên tiếp).
**Danh Mục Lễ/Tết:** Cấu hình ngày Lễ/Tết. Hệ thống tự động map hệ số lương đặc biệt cho ngày công/trực rơi vào danh mục này.
**Đồng Bộ Dữ Liệu Tự Động:** Các ngày nghỉ (Phép, Ốm, Thai sản) được duyệt qua Cổng ESS tự động đổ vào bảng công.
**Quy Trình Đối Soát & Chốt Công 3 Cấp:**
    **Khoa/Phòng:** Xếp lịch -> Cập nhật thực tế -> Chốt công Khoa (Khóa sửa đổi cấp khoa).
    **Nhân Sự:** HR đối chiếu lịch BHXH, phép năm -> Chốt công Toàn viện.
    **Kế Toán:** Tiếp nhận dữ liệu sạch sang phân hệ Lương.

# 6. PHÂN HỆ TÍNH LƯƠNG, KPI, THUẾ & BHXH (PAYROLL, PERFORMANCE & TAX)
**Đánh Giá KPI & Thu Nhập Tăng Thêm:** Ghi nhận điểm A, B, C (dựa trên sự cố y khoa, khen thưởng) để nhân hệ số lương kinh doanh.
**Tính Toán Lương Cơ Bản & BHXH:** Tự động tách ngày BV trả lương và ngày BHXH chi trả. Áp dụng bảng lịch sử hệ số/phụ cấp.
**Phụ Cấp Tiền Ăn Ca Trực:** Tự động lấy số ca trực từ bảng công nhân với định mức tiền ăn.
**Dịch Vụ (PT-TT) & Khấu Trừ:** Import từ HIS qua bảng Staging. Tính thuế TNCN lũy tiến, quản lý người phụ thuộc.
**Hiệu Chỉnh Lương (Pre-Freeze Editing):** Cho phép chỉnh sửa thủ công phụ cấp/phải trả phút chót trước khi chốt.
**Chốt Lương (Payroll Freeze):** Khóa sổ cuối tháng (IsLocked = 1). Chỉ tài khoản cấp cao có quyền mở khóa (ghi log lý do).

# 7. PHÂN HỆ BÁO CÁO & THÔNG BÁO (REPORTING & COMMUNICATIONS)
**Báo Cáo Chuẩn Hóa:** Xuất Excel/PDF báo cáo lao động, BHXH, Thuế TNCN chuẩn format cơ quan nhà nước.
**Giao Tiếp:** Dynamic Email Templates chống XSS. Message Queue gửi phiếu lương hàng loạt mượt mà, không nghẽn server.

## 8. TIÊU CHUẨN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX GUIDELINES)
- **Bảng Màu Chủ Đạo (Theme):** "Medical Trust Blue" (Xanh dương y tế). Sử dụng nền trắng tinh khiết kết hợp với các dải màu từ xanh dương đậm đến xanh nhạt.
- **Phong Cách Thiết Kế:** Tạo chiều sâu (3D-style) bằng cách sử dụng hiệu ứng đổ bóng mềm (soft box-shadow) màu xanh nhạt cho các thẻ (Card) và các khối nổi.
- **5 Bố Cục Giao Diện Tiêu Chuẩn (Layout Templates):**
    1. **Admin Dashboard:** Top-bar đồ họa dải sóng lượn (Wave Header) từ xanh đậm sang nhạt. Các khối thống kê (Card) nằm đè lên phần dải sóng tạo cảm giác xếp lớp.
    2. **Data Grid (Bảng dữ liệu):** Sidebar trái màu xanh dương đậm cố định. Bảng dữ liệu có dòng chẵn nền trắng, dòng lẻ nền xanh băng (Ice Blue) giúp dễ dò dòng. Bắt buộc có Sticky Header.
    3. **Split-Pane Detail (Phân tách 30/70):** Dùng cho thao tác chi tiết (như Chốt lương). Pane trái (30%) hiển thị danh sách. Pane phải (70%) hiển thị chi tiết dạng Form trắng. **Ràng buộc: Nhóm nút hành động (Lưu nháp, Chốt) BẮT BUỘC đặt cố định ở góc trên cùng bên phải của Pane phải.**
    4. **Interactive Calendar (Xếp lịch/Chấm công):** Giao diện lưới lịch toàn màn hình. Hỗ trợ thao tác kéo-thả (Drag & Drop) khối ca trực mượt mà. Phân biệt ca trực bằng màu khối (Ca 12h: nền xanh lơ; Ca 24h: nền xanh đậm, chữ trắng).
    5. **Mobile-First ESS (Cổng nhân viên):** Bố cục không dùng Sidebar. Sử dụng Bottom Navigation. Header thiết kế dải sóng cong chứa Avatar. Các nút chức năng dạng Card to, bo góc lớn (16px), đổ bóng nổi rõ để dễ chạm bằng ngón tay.