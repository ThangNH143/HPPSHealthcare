import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";
import { EmpQualification } from "../entities/EmpQualification";
import { EmpDepartment } from "../entities/EmpDepartment";
import { EmpPosition } from "../entities/EmpPosition";

export class EmployeeController {
    // ==========================================================
    // 1. LẤY DANH SÁCH TOÀN BỘ NHÂN VIÊN
    // ==========================================================
    static async getAllEmployees(req: Request, res: Response) {
        try {
            const employeeRepo = AppDataSource.getRepository(Employee);
            const employees = await employeeRepo.find({
                relations: ["department", "position", "jobTitle"], 
                order: { FullName: "ASC" as const }
            });
            res.status(200).json({ success: true, data: employees });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
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
}