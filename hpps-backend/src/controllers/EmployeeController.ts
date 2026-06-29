// src/controllers/EmployeeController.ts
import { Request, Response } from "express";
import * as ExcelJS from "exceljs";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";
import { EmpQualification } from "../entities/EmpQualification";
import { EmpDepartment } from "../entities/EmpDepartment";
import { EmpPosition } from "../entities/EmpPosition";

export class EmployeeController {
    // ==========================================================
    // 1. LẤY DANH SÁCH NHÂN VIÊN (CÓ PHÂN TRANG & TÌM KIẾM TỐI ƯU)
    // ==========================================================
    static async getAllEmployees(req: Request, res: Response) {
        try {
            // 1. Nhận params, parse cẩn thận chống lỗi kiểu dữ liệu
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 15;
            const search = req.query.search as string || "";
            const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : null;
            
            // 2. Gọi Stored Procedure truyền tham số (Chống SQL Injection tuyệt đối)
            const rawData = await AppDataSource.query(
                `EXEC sp_GetEmployees_Paginated @Page=@0, @Limit=@1, @Search=@2, @DepartmentID=@3, @IsExport=0`,
                [page, limit, search, departmentId]
            );

            // 3. Xử lý logic đếm trang từ cột TotalRecords
            const total = rawData.length > 0 ? rawData[0].TotalRecords : 0;
            const totalPages = Math.ceil(total / limit);

            // 4. Map dữ liệu bảng phẳng từ DB thành Object JSON phân cấp cho Frontend
            const employees = rawData.map((row: any) => ({
                EmployeeID: row.EmployeeID,
                EmployeeCode: row.EmployeeCode,
                FullName: row.FullName,
                Gender: row.Gender,
                BirthDate: row.BirthDate,
                PhoneNumber: row.PhoneNumber,
                IsActive: row.IsActive,
                department: row.DepartmentID ? { DepartmentID: row.DepartmentID, DepartmentName: row.DepartmentName } : null,
                position: row.PositionID ? { PositionID: row.PositionID, PositionName: row.PositionName } : null,
                jobTitle: row.JobTitleID ? { JobTitleID: row.JobTitleID, JobTitleName: row.JobTitleName } : null,
            }));

            // 5. Trả về đúng Format DTO
            return res.status(200).json({ 
                success: true, 
                data: employees,
                meta: { total, totalPages, page, limit }
            });

        } catch (error) {
            console.error("Lỗi khi gọi Store Danh sách nhân viên:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server API" });
        }
    }

    // ==========================================================
    // 2. LẤY CHI TIẾT 1 HỒ SƠ NHÂN VIÊN 
    // ==========================================================
    static async getEmployeeById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const employeeRepo = AppDataSource.getRepository(Employee);
            
            const employee = await employeeRepo.findOne({
                where: { EmployeeID: id },
                relations: [
                    "department", "position", "jobTitle", "salaryStep", 
                    "currentWard", "currentWard.province",
                    "qualifications", "departments", "positions", "allowances"
                ]
            });

            if (!employee) {
                return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ nhân viên" });
            }
            res.status(200).json({ success: true, data: employee });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết nhân viên:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    // ==========================================================
    // 3. THÊM MỚI NHÂN VIÊN (DÙNG TRANSACTION)
    // ==========================================================
    static async createEmployee(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const data = req.body;

            const newEmployee = new Employee();
            
            // --- 1. Thông tin Hành chính ---
            newEmployee.EmployeeCode = data.EmployeeCode;
            newEmployee.FullName = data.FullName;
            newEmployee.Gender = data.Gender === "Nam" ? true : false;
            newEmployee.BirthDate = data.DOB ? new Date(data.DOB) : (null as any);
            newEmployee.IdentityCardNumber = data.CCCD || (null as any);
            newEmployee.IdentityCardDate = data.IssueDate ? new Date(data.IssueDate) : (null as any);
            newEmployee.IdentityCardPlace = data.IssuePlace || (null as any);
            newEmployee.PhoneNumber = data.Phone || (null as any);
            newEmployee.Email = data.Email || (null as any);
            newEmployee.Ethnicity = data.Ethnicity || (null as any);
            newEmployee.Religion = data.Religion || (null as any);
            newEmployee.BHYT = data.BHYT || (null as any);
            newEmployee.BHXH = data.BHXH || (null as any);

            // --- 2. Thông tin Địa chỉ ---
            newEmployee.BirthPlaceProvinceID = data.BirthPlaceProvinceID ? Number(data.BirthPlaceProvinceID) : (null as any);
            newEmployee.HometownProvinceID = data.ProvinceID ? Number(data.ProvinceID) : (null as any);
            newEmployee.CurrentWardID = data.WardID ? Number(data.WardID) : (null as any);
            newEmployee.HamletAddress = data.AddressDetail || (null as any);

            // --- 3. Tính chất nhân sự ---
            newEmployee.EmployeeType = data.EmployeeType || (null as any);
            newEmployee.RecruitmentSource = data.RecruitmentSource || (null as any);
            newEmployee.ProbationStatus = data.ProbationStatus || (null as any);
            newEmployee.ContractURL = data.ContractURL || (null as any);

            // --- 4. Trạng thái Công tác hiện tại ---
            newEmployee.DepartmentID = data.DepartmentID ? Number(data.DepartmentID) : (null as any);
            newEmployee.PositionID = data.PositionID ? Number(data.PositionID) : (null as any);
            newEmployee.JoinDate = data.ValidFrom_Dept ? new Date(data.ValidFrom_Dept) : (null as any);           

            // --- 5. Chứng chỉ hành nghề (CCHN) ---
            newEmployee.LicenseNumber = data.CCHN_Number || (null as any);
            newEmployee.LicenseDate = data.CCHN_IssueDate ? new Date(data.CCHN_IssueDate) : (null as any);
            newEmployee.LicenseEndDate = data.CCHN_ExpDate ? new Date(data.CCHN_ExpDate) : (null as any);
            
            // ==========================================
            // MỚI BỔ SUNG LƯU THÔNG TIN ĐẢNG & MỐC LƯƠNG
            // ==========================================
            newEmployee.PartyJoinDatePreliminary = data.PartyJoinDatePreliminary ? new Date(data.PartyJoinDatePreliminary) : (null as any);
            newEmployee.PartyJoinDateOfficial = data.PartyJoinDateOfficial ? new Date(data.PartyJoinDateOfficial) : (null as any);
            newEmployee.PartyCardNumber = data.PartyCardNumber || (null as any);
            newEmployee.PartyCardIssueDate = data.PartyCardIssueDate ? new Date(data.PartyCardIssueDate) : (null as any);
            newEmployee.PartyCell = data.PartyCell || (null as any);

            newEmployee.JobTitleID = data.JobTitleID ? Number(data.JobTitleID) : (null as any);
            newEmployee.SalaryStepID = data.StepID ? Number(data.StepID) : (null as any);
            newEmployee.SalaryStartDate = data.SalaryStartDate ? new Date(data.SalaryStartDate) : (null as any); // Mốc ngày nâng lương
            newEmployee.Note = data.Note || (null as any);

            // Lưu bảng lõi
            const savedEmployee = await queryRunner.manager.save(newEmployee);

            // 3.2. LƯU BẰNG CẤP / CHỨNG CHỈ (Emp_Qualifications)
            if (data.qualifications && Array.isArray(data.qualifications)) {
                for (const qualData of data.qualifications) {
                    if (!qualData.QualName) continue; 

                    const qual = new EmpQualification();
                    qual.EmployeeID = savedEmployee.EmployeeID; 
                    qual.QualName = qualData.QualName;
                    qual.QualType = qualData.QualType || "Chuyên môn";
                    qual.IssuePlace = qualData.IssuePlace || (null as any);
                    qual.IssueDateText = qualData.IssueDateText || (null as any);
                    qual.AttachmentURL = qualData.AttachmentURL || (null as any);

                    if (qual.IssueDateText) {
                        const text = qual.IssueDateText.trim();
                        if (/^\d{4}$/.test(text)) {
                            qual.ParsedDate = new Date(`${text}-01-01`); 
                        } else if (/^\d{1,2}\/\d{4}$/.test(text)) {
                            const parts = text.split("/");
                            qual.ParsedDate = new Date(`${parts[1]}-${parts[0].padStart(2, '0')}-01`); 
                        } else {
                            const parsed = new Date(text);
                            if (!isNaN(parsed.getTime())) qual.ParsedDate = parsed;
                        }
                    }
                    await queryRunner.manager.save(qual);
                }
            }

            // 3.3. LƯU LỊCH SỬ KHOA / PHÒNG (Emp_Departments)
            if (data.DepartmentID) {
                const empDept = new EmpDepartment();
                empDept.EmployeeID = savedEmployee.EmployeeID;
                empDept.DepartmentID = Number(data.DepartmentID);
                empDept.ValidFrom = data.ValidFrom_Dept ? new Date(data.ValidFrom_Dept) : new Date();
                empDept.DecisionURL = data.DecisionURL_Dept || (null as any);
                await queryRunner.manager.save(empDept);
            }

            // 3.4. LƯU LỊCH SỬ CHỨC VỤ (Emp_Positions)
            if (data.PositionID) {
                const empPos = new EmpPosition();
                empPos.EmployeeID = savedEmployee.EmployeeID;
                empPos.PositionID = Number(data.PositionID);
                empPos.ValidFrom = data.ValidFrom_Pos ? new Date(data.ValidFrom_Pos) : new Date();
                empPos.DecisionURL = data.DecisionURL_Pos || (null as any);
                await queryRunner.manager.save(empPos);
            }

            await queryRunner.commitTransaction();
            
            return res.status(201).json({
                success: true,
                message: "Lưu hồ sơ nhân sự thành công!",
                data: savedEmployee
            });

        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            console.error("Lỗi khi lưu nhân sự: ", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi Server hoặc Mã nhân sự đã tồn tại!",
                error: error.message
            });
        } finally {
            await queryRunner.release();
        }
    }

    // ==========================================================
    // 4. CẬP NHẬT HỒ SƠ NHÂN VIÊN (DÙNG TRANSACTION)
    // ==========================================================
    static async updateEmployee(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const id = parseInt(req.params.id as string);
            const data = req.body;

            const employeeRepo = queryRunner.manager.getRepository(Employee);
            const existingEmployee = await employeeRepo.findOne({ where: { EmployeeID: id } });

            if (!existingEmployee) {
                await queryRunner.rollbackTransaction();
                return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ nhân sự!" });
            }

            // 1. Cập nhật bảng lõi (Dim_Employees)
            Object.assign(existingEmployee, {
                EmployeeCode: data.EmployeeCode,
                FullName: data.FullName,
                Gender: data.Gender === "Nam" ? true : false,
                BirthDate: data.DOB ? new Date(data.DOB) : null,
                IdentityCardNumber: data.CCCD || null,
                IdentityCardDate: data.IssueDate ? new Date(data.IssueDate) : null,
                IdentityCardPlace: data.IssuePlace || null,
                PhoneNumber: data.Phone || null,
                Email: data.Email || null,
                Ethnicity: data.Ethnicity || null,
                Religion: data.Religion || null,
                BHYT: data.BHYT || null,
                BHXH: data.BHXH || null,
                BirthPlaceProvinceID: data.BirthPlaceProvinceID ? Number(data.BirthPlaceProvinceID) : null,
                HometownProvinceID: data.ProvinceID ? Number(data.ProvinceID) : null,
                CurrentWardID: data.WardID ? Number(data.WardID) : null,
                HamletAddress: data.AddressDetail || null,
                EmployeeType: data.EmployeeType || null,
                RecruitmentSource: data.RecruitmentSource || null,
                ProbationStatus: data.ProbationStatus || null,
                ContractURL: data.ContractURL || null,
                DepartmentID: data.DepartmentID ? Number(data.DepartmentID) : null,
                PositionID: data.PositionID ? Number(data.PositionID) : null,
                JobTitleID: data.JobTitleID ? Number(data.JobTitleID) : null,
                SalaryStepID: data.StepID ? Number(data.StepID) : null,
                SalaryStartDate: data.SalaryStartDate ? new Date(data.SalaryStartDate) : null,
                LicenseNumber: data.CCHN_Number || null,
                LicenseDate: data.CCHN_IssueDate ? new Date(data.CCHN_IssueDate) : null,
                LicenseEndDate: data.CCHN_ExpDate ? new Date(data.CCHN_ExpDate) : null,
                PartyJoinDatePreliminary: data.PartyJoinDatePreliminary ? new Date(data.PartyJoinDatePreliminary) : null,
                PartyJoinDateOfficial: data.PartyJoinDateOfficial ? new Date(data.PartyJoinDateOfficial) : null,
                PartyCardNumber: data.PartyCardNumber || null,
                PartyCardIssueDate: data.PartyCardIssueDate ? new Date(data.PartyCardIssueDate) : null,
                PartyCell: data.PartyCell || null,
                Note: data.Note || null,
            });

            await employeeRepo.save(existingEmployee);

            // 2. Cập nhật bằng cấp (Xóa cũ, chèn mới cho an toàn)
            if (data.qualifications && Array.isArray(data.qualifications)) {
                await queryRunner.manager.delete(EmpQualification, { EmployeeID: id });
                
                for (const qualData of data.qualifications) {
                    if (!qualData.QualName) continue; 

                    const qual = new EmpQualification();
                    qual.EmployeeID = id; 
                    qual.QualName = qualData.QualName;
                    qual.QualType = qualData.QualType || "Chuyên môn";
                    qual.IssuePlace = qualData.IssuePlace || null;
                    qual.IssueDateText = qualData.IssueDateText || null;
                    qual.AttachmentURL = qualData.AttachmentURL || null;

                    await queryRunner.manager.save(qual);
                }
            }

            await queryRunner.commitTransaction();
            
            return res.status(200).json({
                success: true,
                message: "Cập nhật hồ sơ nhân sự thành công!",
                data: existingEmployee
            });

        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            console.error("Lỗi khi cập nhật nhân sự: ", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi Server khi cập nhật hồ sơ!",
                error: error.message
            });
        } finally {
            await queryRunner.release();
        }
    }

    // ==========================================================
    // 5. XUẤT EXCEL DANH SÁCH NHÂN SỰ (GỌI STORED PROCEDURE)
    // ==========================================================
    static async exportEmployees(req: Request, res: Response) {
        try {
            const search = req.query.search as string || "";
            const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : null;

            // 1. GỌI STORED PROCEDURE BẢO MẬT (Truyền @IsExport = 1 để lấy tất cả)
            const rawData = await AppDataSource.query(
                `EXEC sp_GetEmployees_Paginated @Page=1, @Limit=1, @Search=@0, @DepartmentID=@1, @IsExport=1`,
                [search, departmentId]
            );

            // 2. Khởi tạo Workbook Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Danh_Sach_Nhan_Su", {
                views: [{ state: 'frozen', ySplit: 1 }] // Cố định Header
            });

            // Cấu hình Cột
            worksheet.columns = [
                { header: "STT", key: "stt", width: 5 },
                { header: "Mã NV", key: "code", width: 12 },
                { header: "Họ và Tên", key: "fullName", width: 25 },
                { header: "Giới tính", key: "gender", width: 10 },
                { header: "Ngày sinh", key: "dob", width: 15 },
                { header: "Số CCCD", key: "cccd", width: 20 },
                { header: "Ngày cấp CCCD", key: "issueDate", width: 15 },
                { header: "Nơi cấp", key: "issuePlace", width: 25 },
                { header: "SĐT", key: "phone", width: 15 },
                { header: "Email", key: "email", width: 25 },
                { header: "Dân tộc", key: "ethnicity", width: 15 },
                { header: "Tôn giáo", key: "religion", width: 15 },
                { header: "Mã BHYT", key: "bhyt", width: 20 },
                { header: "Mã BHXH", key: "bhxh", width: 20 },
                { header: "Tỉnh/TP Thường trú", key: "province", width: 25 },
                { header: "Xã/Phường", key: "ward", width: 20 },
                { header: "Địa chỉ chi tiết", key: "address", width: 35 },
                { header: "Loại nhân sự", key: "empType", width: 20 },
                { header: "Khoa / Phòng Ban", key: "department", width: 30 },
                { header: "Chức Vụ", key: "position", width: 25 },
                { header: "Chức Danh Nghề Nghiệp", key: "jobTitle", width: 25 },
                { header: "Bậc lương", key: "salaryStep", width: 15 },
                { header: "Mốc hưởng lương", key: "salaryDate", width: 15 },
                { header: "Số CCHN", key: "cchn", width: 20 },
                { header: "Hạn CCHN", key: "cchnExp", width: 15 },
                { header: "Ngày vào Đảng (CT)", key: "partyDate", width: 15 },
                { header: "Bằng cấp / Chứng chỉ", key: "quals", width: 40 },
                { header: "Ghi chú", key: "note", width: 30 },
                { header: "Trạng thái", key: "status", width: 15 },
            ];

            // Style Header: Nền Xanh Y Tế (#1D4ED8), Chữ Trắng In Đậm
            worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
            worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
            worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

            // Format ngày tháng
            const formatDate = (date: any) => {
                if (!date) return "";
                return new Date(date).toLocaleDateString("vi-VN");
            };

            // 3. Đổ dữ liệu (Map trực tiếp từ kết quả Store trả về)
            rawData.forEach((emp: any, index: number) => {
                worksheet.addRow({
                    stt: index + 1,
                    code: emp.EmployeeCode || "",
                    fullName: emp.FullName || "",
                    gender: emp.Gender ? "Nam" : "Nữ",
                    dob: formatDate(emp.BirthDate),
                    cccd: emp.IdentityCardNumber || "",
                    issueDate: formatDate(emp.IdentityCardDate),
                    issuePlace: emp.IdentityCardPlace || "",
                    phone: emp.PhoneNumber || "",
                    email: emp.Email || "",
                    ethnicity: emp.Ethnicity || "",
                    religion: emp.Religion || "",
                    bhyt: emp.BHYT || "",
                    bhxh: emp.BHXH || "",
                    province: emp.ProvinceName || "",       
                    ward: emp.WardName || "",               
                    address: emp.HamletAddress || "",
                    empType: emp.EmployeeType || "",
                    department: emp.DepartmentName || "",   
                    position: emp.PositionName || "",       
                    jobTitle: emp.JobTitleName || "",       
                    salaryStep: emp.StepName || "",         
                    salaryDate: formatDate(emp.SalaryStartDate),
                    cchn: emp.LicenseNumber || "",
                    cchnExp: formatDate(emp.LicenseEndDate),
                    partyDate: formatDate(emp.PartyJoinDateOfficial),
                    quals: emp.QualificationsString || "", 
                    note: emp.Note || "",
                    status: emp.IsActive ? "Đang làm việc" : "Đã nghỉ việc",
                });
            });

            // Gắn Header HTTP để trình duyệt hiểu đây là file tải xuống
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=Danh_Sach_Nhan_Su_${new Date().getTime()}.xlsx`);

            await workbook.xlsx.write(res);
            return res.status(200).end();

        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server khi xuất Excel" });
        }
    }

    // ==========================================================
    // 6. LẤY DỮ LIỆU DASHBOARD HỒ SƠ NHÂN SỰ
    // ==========================================================
    static async getEmployeeDashboard(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            
            const rawData = await AppDataSource.query(
                `EXEC sp_GetEmployeeDashboard_ByID @EmployeeID=@0`, [id]
            );

            if (!rawData || rawData.length === 0) {
                 return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ nhân sự!" });
            }

            // Dữ liệu Store trả về nằm trong Object key tự sinh của MSSQL (hoặc key rỗng). 
            // Ta sẽ extract chuỗi JSON đó ra và parse lại.
            const jsonString = Object.values(rawData[0])[0] as string;
            const dashboardData = JSON.parse(jsonString);

            return res.status(200).json({ success: true, data: dashboardData });
        } catch (error) {
            console.error("Lỗi khi lấy Dashboard nhân viên:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
}