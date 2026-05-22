import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Department } from "../entities/Department";

export class DepartmentController {
    static async getAllDepartments(req: Request, res: Response) {
        try {
            const deptRepository = AppDataSource.getRepository(Department);
            const departments = await deptRepository.find({
                order: { DepartmentName: "ASC" as const } // Đã bao gồm fix lỗi số 2
            });
            res.status(200).json({ success: true, data: departments });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Phòng ban:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
}