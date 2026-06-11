# Tên Dự Án: Hệ Thống Quản Lý Nhân Sự & Tiền Lương Y Tế (Healthcare HR & Payroll System)

## KIẾN TRÚC CÔNG NGHỆ TỔNG THỂ (ARCHITECTURE STACK)
- **Frontend (Giao diện):** ReactJS (Functional Components, Hooks, TailwindCSS).
- **Backend (Máy chủ xử lý):** Node.js (Express framework, RESTful API, Service-Repository pattern).
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
  - Mọi thao tác tính toán lương, chốt công, import dữ liệu từ HIS phải được bao bọc trong câu lệnh SQL `TRANSACTION`.
- **Tiêu Chuẩn Sạch (Clean Code):** Code phải viết hoa từ khóa SQL, đặt tên bảng/cột bằng tiếng Anh rõ nghĩa. Bắt buộc có COMMENT TIẾNG VIỆT giải thích luồng logic, đặc biệt tại các module tính lương và chốt công.

---

# 2. PHÂN HỆ NGHIỆP VỤ CHI TIẾT THEO PHA (PHASED BUSINESS LOGIC)

## PHASE 1: CORE HR, CREDENTIALS & PORTAL
- **Cổng Thông Tin Nhân Viên (ESS/MSS):** Giao diện ReactJS độc lập giúp nhân viên xem phiếu lương, lịch trực, gửi đơn đổi ca, xin nghỉ phép, xem CME. Cấp quản lý phê duyệt đơn từ trực tiếp trên hệ thống.
- **Quản Lý Hồ Sơ & Vị Trí Việc Làm:** Ghi nhận lịch sử luân chuyển khoa/phòng, chức vụ của nhân viên dựa trên các mốc thời gian hiệu lực (`ValidFrom` - `ValidTo`). Đây là cơ sở cốt lõi để phân hệ lương tự động chẻ ngày tính phụ cấp.
- **Quản Lý CCHN & CME:** Ghi nhận Số chứng chỉ hành nghề, ngày cấp, danh mục tiết học CME tích lũy. Hệ thống chạy Cron-job tự động quét hàng ngày để đưa ra cảnh báo popup/email cho HR khi chứng chỉ sắp hết hạn.
- **Quản Lý Thực Hành Sinh (Interns):** Quản lý luân khoa liên tục theo chu kỳ (từ 9 đến 18 tháng) để cấp CCHN. Tự động gán và lưu vết Bác sĩ hướng dẫn (Mentor) cho từng thực hành sinh.
- **Quy Quy Trình Nghỉ Việc (Offboarding):** Tích hợp check-list số hóa để kiểm soát việc thu hồi tài sản, thẻ từ, đồng phục y tế từ các phòng ban liên quan trước khi Kế toán thực hiện bấm nút chốt lương cuối cùng.

## PHASE 2: SMART ROSTERING & TIMESHEET (CHẤM CÔNG)
- **Xếp Lịch Trực Thông Minh:** Thiết kế giao diện kéo thả (Drag & Drop) trực quan. Tích hợp Rule Engine tự động quét và đưa ra cảnh báo vi phạm luật trực y tế (Ví dụ: Cấm không được trực 2 ca 24h liên tiếp; Bác sĩ vừa trực ca 24h hôm trước không được xếp lịch mổ chính vào sáng hôm sau).
- **Quản Lý Lễ/Tết:** Hệ thống tự động map danh mục ngày Lễ/Tết quốc gia để áp dụng hệ số nhân công/trực đặc biệt (Ví dụ: x300% hoặc x400% tùy quy chế viện) khi nhân sự có lịch làm việc thực tế.
- **Chuyển Đổi Tính Chất Công (Override ca trực):** Cho phép thủ trưởng khoa bấm ghi nhận đè tính chất ca trực thực tế (Ca thường quy, ca trực có phụ cấp, trực 12h, trực 24h). Hệ thống tự động đồng bộ thời gian nghỉ (Phép năm, nghỉ ốm, thai sản) đã được duyệt từ ESS sang bảng công.
- **Ghi Nhận Phụ Cấp Bất Thường Khi Chấm Công:** Cho phép ghi nhận tỷ lệ % hưởng phụ cấp không thường xuyên hoặc hệ số cộng dồn (như mổ tăng cường, hỗ trợ tuyến) cho nhân sự và **bắt buộc ghi nhận lý do hưởng** khi chấm công từng tháng để phục vụ công tác kiểm toán (Audit).
- **Quy Trình Chốt Công 3 Cấp Chặt Chẽ:**
  1. *Cấp Khoa/Phòng:* Điều dưỡng trưởng/Trưởng khoa xếp lịch -> Đối soát thực tế -> Bấm chốt công Khoa (Hệ thống khóa quyền sửa đổi của khoa đó).
  2. *Cấp Nhân Sự:* Phòng Tổ chức Cán bộ rà soát đối chiếu với dữ liệu BHXH, phép năm toàn viện -> Bấm chốt công Toàn viện.
  3. *Cấp Kế Toán:* Tiếp nhận bảng công sạch hoàn toàn để làm đầu vào chạy phân hệ Lương.

## PHASE 3: PAYROLL, KPI & PERFORMANCE TAX (TÍNH LƯƠNG & THUẾ)
- **KPI & Thu Nhập Tăng Thêm:** Kết nối kết quả đánh giá hiệu suất (Xếp loại chất lượng công việc) để nhân hệ số lương kinh doanh/lương tăng thêm. 
- **Ma Trận Đánh Giá ABC Hàng Tháng (Mới chốt):** Thu nhập tăng thêm tính theo nguyên tắc phân bổ từ trên xuống:
  - *Cấp Khoa/Phòng (`Dept_MonthlyEvaluations`):* Khoa phòng được chấm điểm hiệu suất và xếp thành 5 mức dựa theo thi đua tập thể: A (1.2), B1 (1.0), B2 (0.8), B3 (0.6), C (0.4) để xác định tổng quỹ thưởng của khoa.
  - *Cấp Cá Nhân (`Emp_MonthlyEvaluations`):* Nhân viên được khoa xếp loại thành 5 mức để tính Hệ số hiệu suất lao động cá nhân: A (1.2), B1 (0.9), B2 (0.6), B3 (0.3), C (0.00).
  - *Công thức Lương Tăng Thêm:* Phụ thuộc vào Biến số K (Hệ số điều chỉnh thu nhập tăng thêm cơ bản do Ban Giám đốc nhập vào theo từng tháng dựa trên chênh lệch thu-chi của viện) nhân với Hệ số hiệu suất cá nhân và Tập thể.
- **Tính Lương Modular Đa Nguồn:** Tách biệt rõ ràng phần ngày lương do Bệnh viện chi trả và phần ngày lương do Cơ quan BHXH chi trả (ốm đau, thai sản). Áp dụng bảng lịch sử hệ số/phụ cấp tại mốc thời gian tính lương (Effective-Dated records).
- **Cơ Chế Tính 4 Nhóm Phụ Cấp Đặc Thù Ngành Y:**
  - *Phụ cấp ưu đãi nghề:* Tính theo tỷ lệ % hệ số lương cơ bản dựa trên Chức danh nghề nghiệp (Ví dụ: Bác sĩ 40%, Điều dưỡng 20%).
  - *Phụ cấp độc hại:* Tính theo hệ số cộng dồn dựa trên vị trí việc làm thực tế tại khoa. (Ví dụ: Cùng là Điều dưỡng khoa Sản nhưng Điều dưỡng làm phòng thủ thuật hưởng hệ số độc hại 0.1, Điều dưỡng làm hành chính hưởng 0.0). Tính chịu thuế hay không chịu thuế theo quy chế.
  - *Phụ cấp trách nhiệm:* Cộng theo hệ số dựa trên chức vụ hoặc phân công đặc thù (Hệ số cộng vào lương cơ bản để nhân mức lương cơ sở).
  - *Phụ cấp chức vụ:* Tính theo hệ số đi liền với lương (Chịu thuế TNCN).
- **Phụ Cấp Tiền Ăn Ca Trực:** Tự động tính toán theo công thức: `[Tổng số ca trực thực tế lấy từ bảng công Phase 2] x [Định mức tiền ăn ca trực do viện cấu hình]`.
- **Tích Hợp Dịch Vụ Khối HIS (Phẫu thuật - Thủ thuật):** Import dữ liệu thù lao PT-TT trực tiếp từ hệ thống HIS vào bảng tạm (`Staging Table`), chạy tập lệnh kiểm tra trùng lặp và validate, sau đó dùng lệnh `MERGE` có bao bọc `TRANSACTION` để đồng bộ an toàn vào bảng lương chính thức.
- **Thuế TNCN & Giảm Trừ Gia Cảnh:** Tính thuế lũy tiến từng phần tự động. Quản lý danh sách người phụ thuộc nghiêm ngặt theo tháng bắt đầu và tháng kết thúc hiệu lực.
- **Quy Trình Chốt Lương (Freeze Payroll):** Cho phép Kế toán hiệu chỉnh thủ công các khoản phát sinh phút chót (Pre-freeze editing) -> Bấm nút Chốt sổ khóa dữ liệu lương (`IsLocked=1`). Toàn bộ dữ liệu tháng đó đóng băng tuyệt đối, không ai có quyền chỉnh sửa.

## PHASE 4: REPORTING & COMMUNICATIONS
- **Báo Cáo Chuẩn Hóa:** Xuất file Excel/PDF động cho danh sách lao động, báo cáo trích đóng BHXH, tờ khai quyết toán thuế TNCN theo đúng biểu mẫu quy định của Nhà nước.
- **Giao Tiếp Tự Động:** Gửi phiếu lương (Payslip) chi tiết đến từng nhân viên qua Email tự động thông qua hàng đợi tin nhắn (Message Queue) độc lập, sử dụng Dynamic HTML Templates đã qua bộ lọc chống mã độc XSS.

---

# 3. TIÊU CHUẨN GIAO DIỆN UI/UX (UI/UX COMPLIANCE)
- **Bảng Màu Chủ Đạo:** "Medical Trust Blue" (Xanh dương đậm `#0A192F` cho Sidebar, Xanh dương phối sáng cho các nút bấm hành động). Đổ bóng 3D nhẹ dịu cho bảng biểu (`shadow-[0_12px_30px_rgba(14,165,233,0.06)]`).
- **Cấu Hình Môi Trường IIS (Vite base config):** Bắt buộc cấu hình thuộc tính `base: '/QLNhanSuTienLuong/'` trong file `vite.config.ts`. Mọi file hình ảnh tĩnh (như logo bệnh viện) không dùng chuỗi đường dẫn tĩnh mà phải import trực tiếp thành các biến module nội bộ để Vite băm (hash) tự động khi đóng gói build, tránh lỗi 404 trên môi trường server tĩnh của IIS.
- **Dynamic Forms & UX Nhập Liệu:** - Khi thêm mới nhân sự (`EmployeeForm.tsx`), thiết kế cố định sẵn 3 dòng bằng cấp ban đầu để đáp ứng thói quen gõ dữ liệu nhanh của HR. Khi bấm "Lưu", code React tự động loại bỏ các dòng rỗng, đóng gói các dòng có dữ liệu thành mảng (Array) để gửi xuống API.
  - Sau khi nhân viên đã onboarding, các chức năng chỉnh sửa chuyên sâu về Bằng cấp, Hợp đồng, Diễn biến lương sẽ được quản lý tại trang **Hồ sơ chi tiết nhân viên (Employee Profile Dashboard)** bằng cấu hình tab riêng biệt mở rộng không gian, tuyệt đối không nhét quá nhiều nút chức năng vào một hàng table chung gây vỡ khung giao diện.

---

# 🏥 BỐI CẢNH DỰ ÁN VÀ CƠ SỞ DỮ LIỆU HIỆN TẠI (CURRENT PROJECT STATUS)

## 1. CẤU TRÚC DATABASE ĐÃ KHỞI TẠO THÀNH CÔNG TRÊN SQL SERVER
### A. Danh Mục Hệ Thống (Master Data Tables)
1. `Dim_Provinces` & `Dim_Wards`: Danh mục địa lý tinh giản chỉ gồm 2 cấp (Tỉnh và Xã), không có cấp Quận/Huyện. Cột ID sử dụng cơ chế tự tăng `IDENTITY` nhưng hỗ trợ ép ID cũ từ hệ thống khác qua lệnh `SET IDENTITY_INSERT ON`.
2. `Dim_Departments`: Danh mục Khoa/Phòng ban trong viện.
3. `Dim_Positions`: Danh mục Chức vụ quản lý (Trưởng khoa, Phó khoa...).
4. `Dim_JobTitles`: Danh mục Chức danh nghề nghiệp (Bác sĩ chính, Điều dưỡng hạng IV...).
5. `Dim_SalaryGrades`: Danh mục Ngạch lương hệ thống (lưu mốc thời gian giữ bậc định kỳ).
6. `Dim_SalarySteps`: Danh mục Bậc lương & Hệ số tương ứng thuộc từng Ngạch lương.
7. `Dim_ContractTypes`: Danh mục loại hợp đồng (Biên chế, Hợp đồng, Tập sự...). Cấu hình mặc định cột tỷ lệ hưởng lương `Percentage = 100%` (Tập sự cấu hình 85%) và cờ trọn gói `IsLumpSum` (để loại trừ đóng BHXH/Thuế lũy tiến).
8. `Dim_AllowanceTypes`: Danh mục cấu hình loại phụ cấp (Ưu đãi nghề, độc hại, trách nhiệm). Gồm cờ `IsPercentage` và `IsTaxable`.
9. `Dim_PerformanceGrades`: Danh mục hệ số hiệu suất thu nhập A, B1, B2, B3, C đi kèm các tham số hệ số Tập thể và Cá nhân chuẩn theo quy chế thi đua của viện.

### B. Bảng Dữ Liệu Lõi & Quá Trình (Core Entity Tables)
1. `Dim_Employees`: Lưu thông tin hành chính cốt lõi của nhân sự, bổ sung trường Số BHYT, Số BHXH, Phân loại đối tượng nhân sự (`EmployeeType`). *(Thông tin tài khoản ngân hàng được mã hóa AES-256, mã số thuế và số người phụ thuộc được tách biệt sang Phase 3 để cấu hình sau).*
2. `Emp_Qualifications`: Lưu lịch sử bằng cấp/chứng chỉ (1-N). Cột ngày cấp sử dụng trường text `IssueDateText` để linh hoạt nhập "Năm 2015" hoặc "10/2020", đồng thời có cột `ParsedDate` (kiểu `DATE`) do backend tự động parse để phục vụ sắp xếp và chạy job cảnh báo hết hạn. Có cột lưu link file đính kèm `AttachmentURL`.
3. `Emp_Departments`: Lưu lịch sử phân công công tác luân chuyển khoa phòng ban và bổ nhiệm chức vụ quản lý (`ValidFrom` - `ValidTo`), đính kèm link file quyết định `DecisionURL`.
4. `Emp_Allowances`: Lưu chi tiết quá trình hưởng phụ cấp độc hại/trách nhiệm/ưu đãi thực tế của riêng từng cá nhân theo mốc mốc thời gian hiệu lực. Giải quyết triệt để bài toán phân tách phụ cấp ca thủ thuật và ca hành chính của điều dưỡng trong cùng một khoa.
5. `Emp_MonthlyEvaluations` & `Dept_MonthlyEvaluations`: Bảng lưu kết quả chấm điểm xếp loại thi đua ABC hàng tháng của cá nhân nhân viên và của tập thể Khoa phòng ban.

## 2. TIẾN ĐỘ THỰC TẾ ĐÃ HOÀN THÀNH
- [x] **Backend API:** Khai báo hoàn chỉnh kiến trúc MVC, viết xong các file Route, Controller và Entity cho 7 danh mục Master Data nền tảng. Viết và chạy thành công API `GET /provinces/:provinceId/wards` lấy xã theo tỉnh phục vụ cascading.
- [x] **Frontend UI/UX:** Thiết kế xong giao diện `MasterDataSettings.tsx` hỗ trợ quản lý động các danh mục y tế nền. Đã dọn sạch 100% lỗi console duplicate keys, lỗi render nhầm data khi đổi tab.
- [x] **Form Nhân Sự (`EmployeeForm.tsx`):** Thiết kế hoàn chỉnh khung layout 4 Tabs và Sticky Footer. Hoàn thiện xong giao diện Tab 1 (Hành chính) tích hợp Cascading địa chỉ 2 cấp, và Tab 2 (Trình độ & Công tác) tích hợp Dropdown Khoa phòng/Chức vụ thực tế từ SQL Server. Thiết kế xong giao diện Tab 4 (Tiền lương) tích hợp logic Cascading thông minh: Chọn Chức danh nghề nghiệp -> Tự động xác định Ngạch lương -> Tự động lọc danh sách Bậc lương tương ứng và hiển thị Hệ số lương cơ bản trực quan.
- [x] **Deploy Môi Trường:** Xử lý triệt để bug 404 mất file ảnh tĩnh khi build đưa lên chạy Sub-app của máy chủ IIS local.

## 3. CÁC BƯỚC TIẾP THEO (NEXT STEPS)
1. **Phát triển Backend Entity & Controller (Node.js/TypeORM):** Map toàn bộ cấu trúc các bảng SQL lõi mới chốt (`Dim_Employees`, `Emp_Qualifications`, `Emp_Departments`, `Emp_Allowances`) vào lớp dữ liệu của Node.js.
2. **Viết API Nhập Hồ Sơ Toàn Diện:** Xây dựng endpoint `POST /api/employees` sử dụng kỹ thuật Database **`TRANSACTION`** để bóc tách khối `payload` lớn được gửi từ `EmployeeForm.tsx` ở Frontend. API này sẽ tiến hành ghi nhận đồng thời dữ liệu vào bảng `Dim_Employees`, gom mảng 3 dòng bằng cấp chèn vào `Emp_Qualifications` (kèm logic parse ngày tự động), và chèn bản ghi phân công công tác đầu tiên vào `Emp_Departments`.
3. **Cập nhật Giao diện Form (UI):** Sửa đổi `EmployeeForm.tsx` để bổ sung thêm trường nhập liệu số BHXH, BHYT ở Tab 1, ô nhập text tự do ngày cấp bằng cấp ở Tab 2 như user yêu cầu, sau đó thực hiện test lưu chính thức dữ liệu xuống SQL Server.
4. **Xây dựng Employee Profile Dashboard:** Thiết kế trang chi tiết nhân sự toàn diện để HR có thể cập nhật các quá trình biến động về sau (Ký hợp đồng mới, Thao tác thêm phụ cấp cá nhân, Đổi khoa phòng ban...).