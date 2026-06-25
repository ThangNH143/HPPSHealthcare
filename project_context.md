# Tên Dự Án: Hệ Thống Quản Lý Nhân Sự & Tiền Lương Y Tế (Healthcare HR & Payroll System)

## KIẾN TRÚC CÔNG NGHỆ TỔNG THỂ (ARCHITECTURE STACK)
- **Frontend (Giao diện):** ReactJS (Functional Components, Hooks, TailwindCSS).
- **Backend (Máy chủ xử lý):** Node.js (Express framework, RESTful API, Service-Repository pattern), Multer (Xử lý File Upload).
- **Database (Cơ sở dữ liệu):** SQL Server (Quan hệ, Chuẩn hóa dữ liệu cao).

---

# 1. NGUYÊN TẮC BẮT BUỘC & TIÊU CHUẨN LẬP TRÌNH (CORE STANDARDS)
- **Kiến Trúc Tách Biệt (Decoupled):** Ranh giới Contract API giữa Node.js và ReactJS phải tường minh. Không gộp logic db vào giao diện.
- **Bảo Mật Tối Đa (Zero-Trust Architecture):**
  - Mọi API Node.js phải đi qua Middleware Auth và kiểm tra RBAC (Phân quyền đến cấp trường dữ liệu - Field-level Security).
  - Tự động Session Timeout và bắt đăng nhập lại sau 10 phút không thao tác.
  - Chống mã độc XSS bằng `DOMPurify` ở Frontend, validate và filter đầu vào chặt chẽ bằng `Zod`/`Joi` ở Backend.
  - Các dữ liệu siêu nhạy cảm như *Tài khoản ngân hàng, Tổng tiền lương thực nhận* bắt buộc phải mã hóa một chiều hoặc đối xứng bằng thuật toán AES-256 trước khi lưu xuống SQL Server.
  - Bắt buộc dùng `Temporal Tables` (System-Versioned) của SQL Server cho các bảng dữ liệu cốt lõi để tự động lưu vết Audit Log lịch sử thay đổi.
  - Mọi thao tác tính toán lương, chốt công, lưu hồ sơ nhân sự, import dữ liệu từ HIS phải được bao bọc trong câu lệnh SQL `TRANSACTION`.
- **Tiêu Chuẩn Sạch (Clean Code):** Code phải viết hoa từ khóa SQL, đặt tên bảng/cột bằng tiếng Anh rõ nghĩa. Bắt buộc có COMMENT TIẾNG VIỆT giải thích luồng logic, đặc biệt tại các module tính lương và chốt công.

---

# 2. PHÂN HỆ NGHIỆP VỤ CHI TIẾT THEO PHA (PHASED BUSINESS LOGIC)

## PHASE 1: CORE HR, CREDENTIALS & PORTAL
- **Cổng Thông Tin Nhân Viên (ESS/MSS):** Giao diện ReactJS độc lập giúp nhân viên xem phiếu lương, lịch trực, gửi đơn đổi ca, xin nghỉ phép, xem CME. Cấp quản lý phê duyệt đơn từ trực tiếp trên hệ thống.
- **Quản Lý Hồ Sơ & Vị Trí Việc Làm:** Ghi nhận độc lập lịch sử luân chuyển khoa/phòng và lịch sử bổ nhiệm chức vụ quản lý dựa trên các mốc thời gian hiệu lực (`ValidFrom` - `ValidTo`). Hỗ trợ upload và lưu trữ bản scan Hợp đồng/Quyết định.
- **Quản Lý CCHN, Đảng & CME:** Ghi nhận Số chứng chỉ hành nghề, ngày cấp, thẻ Đảng (Tách biệt UI rõ ràng). Hệ thống chạy Cron-job tự động quét hàng ngày để đưa ra cảnh báo popup/email cho HR khi chứng chỉ sắp hết hạn.
- **Quản Lý Thực Hành Sinh (Interns):** Quản lý luân khoa liên tục theo chu kỳ (từ 9 đến 18 tháng) để cấp CCHN. Tự động gán và lưu vết Bác sĩ hướng dẫn (Mentor).
- **Quy Trình Nghỉ Việc (Offboarding):** Tích hợp check-list số hóa để kiểm soát việc thu hồi tài sản, thẻ từ, đồng phục y tế từ các phòng ban liên quan trước khi Kế toán thực hiện bấm nút chốt lương cuối cùng.

## PHASE 2: SMART ROSTERING & TIMESHEET (CHẤM CÔNG)
- **Xếp Lịch Trực Thông Minh:** Thiết kế giao diện kéo thả (Drag & Drop) trực quan. Tích hợp Rule Engine tự động quét và đưa ra cảnh báo vi phạm luật trực y tế (Ví dụ: Cấm không được trực 2 ca 24h liên tiếp; Bác sĩ vừa trực ca 24h hôm trước không được xếp lịch mổ chính vào sáng hôm sau).
- **Quản Lý Lễ/Tết:** Hệ thống tự động map danh mục ngày Lễ/Tết quốc gia để áp dụng hệ số nhân công/trực đặc biệt (Ví dụ: x300% hoặc x400% tùy quy chế viện).
- **Chuyển Đổi Tính Chất Công (Override ca trực):** Cho phép thủ trưởng khoa bấm ghi nhận đè tính chất ca trực thực tế. Tự động đồng bộ thời gian nghỉ (Phép năm, nghỉ ốm, thai sản) đã được duyệt từ ESS sang bảng công.
- **Ghi Nhận Phụ Cấp Bất Thường Khi Chấm Công:** Ghi nhận tỷ lệ % hưởng phụ cấp không thường xuyên hoặc hệ số cộng dồn, bắt buộc ghi nhận lý do hưởng khi chấm công từng tháng để Audit.
- **Quy Trình Chốt Công 3 Cấp Chặt Chẽ:** 1. Cấp Khoa/Phòng -> 2. Cấp Nhân Sự -> 3. Cấp Kế Toán.

## PHASE 3: PAYROLL, KPI & PERFORMANCE TAX (TÍNH LƯƠNG & THUẾ)
- **Ma Trận Đánh Giá ABC Hàng Tháng (Mới chốt):** Thu nhập tăng thêm tính theo nguyên tắc phân bổ từ trên xuống:
  - *Cấp Khoa/Phòng (`Dept_MonthlyEvaluations`):* Xếp loại A (1.2), B1 (1.0), B2 (0.8), B3 (0.6), C (0.4).
  - *Cấp Cá Nhân (`Emp_MonthlyEvaluations`):* Xếp loại A (1.2), B1 (0.9), B2 (0.6), B3 (0.3), C (0.00).
- **Tính Lương Modular Đa Nguồn:** Tách biệt ngày lương Bệnh viện chi trả và BHXH chi trả. Áp dụng bảng lịch sử hệ số/phụ cấp tại mốc thời gian tính lương (Effective-Dated records).
- **Cơ Chế Tính 4 Nhóm Phụ Cấp Đặc Thù Ngành Y:** Phụ cấp ưu đãi nghề (%), Phụ cấp độc hại (Hệ số), Phụ cấp trách nhiệm, Phụ cấp chức vụ.
- **Phụ Cấp Tiền Ăn Ca Trực:** `[Tổng số ca trực thực tế] x [Định mức tiền ăn ca trực]`.
- **Tích Hợp Dịch Vụ Khối HIS:** Import dữ liệu thù lao PT-TT trực tiếp từ HIS vào bảng tạm (`Staging Table`), validate và `MERGE` vào bảng lương chính thức.
- **Thuế TNCN & Chốt Lương (Freeze Payroll):** Tính thuế lũy tiến từng phần tự động. Chốt sổ khóa dữ liệu lương (`IsLocked=1`).

## PHASE 4: REPORTING, COMMUNICATIONS & CONTRACT TRACKING
- **Báo Cáo Chuẩn Hóa:** Xuất file Excel/PDF động cho danh sách lao động, báo cáo trích đóng BHXH, tờ khai quyết toán thuế TNCN.
- **Giao Tiếp Tự Động:** Gửi phiếu lương (Payslip) chi tiết đến từng nhân viên qua Email tự động.
- **Theo Dõi Hợp Đồng (Contract Tracking):** Tách dữ liệu hợp đồng thành một bảng riêng biệt `Emp_Contracts`. Bảng này sẽ lưu trữ quá trình tái ký hợp đồng (Lần 1, Lần 2, Vô thời hạn) kèm theo mốc `ValidFrom`, `ValidTo` và `ContractURL` riêng biệt cho từng lần ký để hệ thống chạy Cron-job tự động quét và cảnh báo HR trước 30 ngày hết hạn.

---

# 3. TIÊU CHUẨN GIAO DIỆN UI/UX (UI/UX COMPLIANCE)
- **Bảng Màu Chủ Đạo:** "Medical Trust Blue" (Xanh dương đậm `#0A192F` cho Sidebar, Xanh dương phối sáng cho các nút bấm hành động).
- **Cấu Hình Môi Trường IIS:** Bắt buộc cấu hình thuộc tính `base: '/QLNhanSuTienLuong/'` trong `vite.config.ts`. Hình ảnh tĩnh import thành biến module nội bộ để Vite băm (hash).
- **Dynamic Forms & UX Nhập Liệu:** Giao diện Form Nhân sự được chia thành 5 Tabs độc lập (Hành chính, Công tác, CCHN, Đảng, Tiền lương) giúp phân mảnh luồng nhập liệu. Tự động loại bỏ các Array rows rỗng trước khi gửi API.

---

# 🏥 BỐI CẢNH DỰ ÁN VÀ CƠ SỞ DỮ LIỆU HIỆN TẠI (CURRENT PROJECT STATUS)

## 1. CẤU TRÚC DATABASE ĐÃ KHỞI TẠO THÀNH CÔNG TRÊN SQL SERVER
### A. Danh Mục Hệ Thống (Master Data Tables)
1. `Dim_Provinces` & `Dim_Wards`, `Dim_Departments`, `Dim_Positions`, `Dim_JobTitles`, `Dim_SalaryGrades`, `Dim_SalarySteps`, `Dim_ContractTypes`, `Dim_AllowanceTypes`, `Dim_PerformanceGrades`.

### B. Bảng Dữ Liệu Lõi & Quá Trình (Core Entity Tables)
1. `Dim_Employees`: Lưu thông tin hành chính cốt lõi. Đã tích hợp các trường CCHN (`LicenseNumber`, `LicenseDate`, `LicenseEndDate`), Đảng (`PartyCardIssueDate`, `PartyJoinDatePreliminary`...), Mốc hưởng lương (`SalaryStartDate`) và URL Hợp đồng (`ContractURL`).
2. `Emp_Qualifications`: Lưu lịch sử bằng cấp/chứng chỉ (1-N), tích hợp parse ngày tự động (`ParsedDate`) và file đính kèm `AttachmentURL`.
3. `Emp_Departments`: Bảng độc lập lưu lịch sử phân công công tác Khoa/Phòng (`ValidFrom` - `ValidTo`), kèm file đính kèm `DecisionURL`.
4. `Emp_Positions`: Bảng độc lập (đã tách rời) chuyên lưu vết lịch sử Bổ nhiệm Chức vụ quản lý, kèm file đính kèm `DecisionURL`.
5. `Emp_Allowances`, `Emp_MonthlyEvaluations`, `Dept_MonthlyEvaluations`: Các bảng theo dõi phụ cấp và thi đua hàng tháng.

## 2. TIẾN ĐỘ THỰC TẾ ĐÃ HOÀN THÀNH
- [x] **Backend API & Master Data:** Khai báo hoàn chỉnh kiến trúc MVC (Route, Controller, TypeORM Entity) cho toàn bộ danh mục nền tảng và cascading địa chỉ.
- [x] **API File Upload:** Tích hợp thành công `multer` xử lý hứng file scan đính kèm (Bằng cấp, Quyết định bổ nhiệm, Hợp đồng) từ Frontend và lưu an toàn xuống máy chủ.
- [x] **API Nhập Hồ Sơ Toàn Diện:** Xây dựng thành công `POST /api/employees` với cơ chế `TRANSACTION` bọc lót. Ghi song song vào bảng lõi `Dim_Employees` và 3 bảng quá trình (`Emp_Qualifications`, `Emp_Departments`, `Emp_Positions`).
- [x] **Frontend Form Nhân Sự (5 Tabs Chuẩn UI/UX):** Hoàn thiện Giao diện Nhập liệu siêu tối ưu (Cascading địa chỉ, Tính lương tự động, Validate CCHN).
- [x] **Trang Danh Sách Nhân Sự (Data Grid):** Giao diện danh sách hiển thị với bộ lọc đa chiều (Khoa phòng, Text Search). Gọi API song song (`Promise.all`) để tối ưu tốc độ tải.
- [x] **Luồng Xem & Chỉnh Sửa Hồ Sơ (Dynamic Form):** Tái sử dụng `EmployeeForm.tsx` thông qua `useParams`. Tự động fetch dữ liệu, fill lại 5 Tabs và chuyển đổi luồng lưu thành gọi API `PUT /api/employees/:id` (Transactions bọc lót toàn diện).

## 3. CÁC BƯỚC TIẾP THEO TRONG PHIÊN LÀM VIỆC MỚI (NEXT STEPS)
1. **Tinh chỉnh UAT Feedback (Nếu có):** Chỉnh sửa các trường hiển thị trên Danh sách Nhân sự hoặc Form nhập liệu nếu End-User có phản hồi sau khi test.
2. **Phát triển Employee Profile Dashboard:** Thiết kế trang chi tiết nhân sự tổng quan (Read-Only) để Giám đốc / HR có thể dễ dàng xem toàn bộ diễn biến lịch sử công tác, lịch sử tăng lương dạng Timeline.
3. **Phân trang & Báo cáo (Pagination & Export):** Nâng cấp Data Grid chuyển sang xử lý Phân trang từ Backend (Server-side Pagination) để đáp ứng quy mô hàng ngàn nhân sự. Bổ sung tính năng Xuất Excel danh sách.
4. **Khởi động Phase 2:** Bắt tay vào mô-đun Xếp lịch trực thông minh và Chấm công (Smart Rostering & Timesheet).