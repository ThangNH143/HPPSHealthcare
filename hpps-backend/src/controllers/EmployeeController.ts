import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";

export class EmployeeController {
    // 1. API Lấy danh sách toàn bộ nhân viên
    static async getAllEmployees(req: Request, res: Response) {
        try {
            const employeeRepo = AppDataSource.getRepository(Employee);
            const employees = await employeeRepo.find({
                // Lấy kèm thông tin tên Phòng ban, Chức vụ, Chức danh để Frontend dễ hiển thị
                relations: ["department", "position", "jobTitle"], 
                order: { FullName: "ASC" as const }
            });
            res.status(200).json({ success: true, data: employees });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    // 2. API Lấy chi tiết 1 hồ sơ nhân viên (Theo ID)
    static async getEmployeeById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const employeeRepo = AppDataSource.getRepository(Employee);
            
            const employee = await employeeRepo.findOne({
                where: { EmployeeID: id },
                relations: [
                    "department", "position", "jobTitle", "salaryStep", 
                    "currentWard", "currentWard.province" // Lấy Xã và tự động kéo luôn Tỉnh của Xã đó
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

    // 3. API Thêm mới nhân viên
    static async createEmployee(req: Request, res: Response) {
        try {
            const employeeRepo = AppDataSource.getRepository(Employee);
            
            // req.body chứa toàn bộ dữ liệu form do Frontend gửi lên
            const newEmployee = employeeRepo.create(req.body); 
            
            // Lưu xuống Database
            const result = await employeeRepo.save(newEmployee);
            
            res.status(201).json({ success: true, message: "Thêm nhân viên thành công", data: result });
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
            // Bắt lỗi trùng mã nhân viên (EmployeeCode)
            res.status(500).json({ success: false, message: "Lỗi Server hoặc Mã nhân sự đã tồn tại!" });
        }
    }
}