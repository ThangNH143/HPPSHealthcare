import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Department } from "../entities/Department";
import { Position } from "../entities/Position";
import { JobTitle } from "../entities/JobTitle";
import { SalaryGrade } from "../entities/SalaryGrade";
import { SalaryStep } from "../entities/SalaryStep"; // Đã thêm Import Bậc lương

// Hàm tiện ích dùng chung để xử lý Xóa an toàn chống sập liên kết khóa ngoại
const SAFELY_DELETE = async (repo: any, id: number, res: Response) => {
    try {
        await repo.delete(id);
        return res.status(200).json({ success: true, message: "Đã xóa vĩnh viễn danh mục thành công" });
    } catch (error: any) {
        if (error.message.includes("REFERENCE constraint") || error.message.includes("FOREIGN KEY")) {
            return res.status(400).json({ 
                success: false, 
                message: "CẢNH BÁO: Dữ liệu danh mục này đã được sử dụng. Không thể xóa cứng! Vui lòng dùng tính năng 'Tạm ngưng'." 
            });
        }
        return res.status(500).json({ success: false, message: "Lỗi hệ sinh thái dữ liệu Server" });
    }
};

export class MasterDataController {
    // ==========================================
    // 1. PHÒNG BAN / KHOA (DEPARTMENTS)
    // ==========================================
    static async getDepartments(req: Request, res: Response) {
        try {
            const data = await AppDataSource.getRepository(Department).find({ order: { DepartmentName: "ASC" as const } });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async createDepartment(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Department);
            const result = await repo.save(repo.create(req.body));
            res.status(201).json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async updateDepartment(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Department);
            const item = await repo.findOneBy({ DepartmentID: parseInt(req.params.id as string) });
            if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            repo.merge(item, req.body);
            res.status(200).json({ success: true, data: await repo.save(item) });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async deleteDepartment(req: Request, res: Response) {
        await SAFELY_DELETE(AppDataSource.getRepository(Department), parseInt(req.params.id as string), res);
    }

    // ==========================================
    // 2. CHỨC VỤ QUẢN LÝ (POSITIONS)
    // ==========================================
    static async getPositions(req: Request, res: Response) {
        try {
            const data = await AppDataSource.getRepository(Position).find({ order: { PositionName: "ASC" as const } });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async createPosition(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Position);
            const result = await repo.save(repo.create(req.body));
            res.status(201).json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async updatePosition(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Position);
            const item = await repo.findOneBy({ PositionID: parseInt(req.params.id as string) });
            if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            repo.merge(item, req.body);
            res.status(200).json({ success: true, data: await repo.save(item) });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async deletePosition(req: Request, res: Response) {
        await SAFELY_DELETE(AppDataSource.getRepository(Position), parseInt(req.params.id as string), res);
    }

    // ==========================================
    // 3. CHỨC DANH NGHỀ NGHIỆP (JOB TITLES)
    // ==========================================
    static async getJobTitles(req: Request, res: Response) {
        try {
            const data = await AppDataSource.getRepository(JobTitle).find({ order: { JobTitleName: "ASC" as const } });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async createJobTitle(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(JobTitle);
            const result = await repo.save(repo.create(req.body));
            res.status(201).json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async updateJobTitle(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(JobTitle);
            const item = await repo.findOneBy({ JobTitleID: parseInt(req.params.id as string) });
            if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            repo.merge(item, req.body);
            res.status(200).json({ success: true, data: await repo.save(item) });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async deleteJobTitle(req: Request, res: Response) {
        await SAFELY_DELETE(AppDataSource.getRepository(JobTitle), parseInt(req.params.id as string), res);
    }

    // ==========================================
    // 4. NGẠCH LƯƠNG (SALARY GRADES)
    // ==========================================
    static async getSalaryGrades(req: Request, res: Response) {
        try {
            const data = await AppDataSource.getRepository(SalaryGrade).find({ order: { GradeCode: "ASC" as const } });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async createSalaryGrade(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(SalaryGrade);
            const result = await repo.save(repo.create(req.body));
            res.status(201).json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async updateSalaryGrade(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(SalaryGrade);
            const item = await repo.findOneBy({ GradeID: parseInt(req.params.id as string) });
            if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            repo.merge(item, req.body);
            res.status(200).json({ success: true, data: await repo.save(item) });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }
    static async deleteSalaryGrade(req: Request, res: Response) {
        await SAFELY_DELETE(AppDataSource.getRepository(SalaryGrade), parseInt(req.params.id as string), res);
    }

    // ==========================================
    // 5. DANH MỤC BẬC LƯƠNG (SALARY STEPS)
    // ==========================================
    static async getSalarySteps(req: Request, res: Response) {
        try {
            const data = await AppDataSource.getRepository(SalaryStep).find({ 
                order: { GradeID: "ASC", StepName: "ASC" as const } 
            });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }

    static async getSalaryStepsByGrade(req: Request, res: Response) {
        try {
            const gradeId = parseInt(req.params.gradeId as string);
            const data = await AppDataSource.getRepository(SalaryStep).find({
                where: { GradeID: gradeId, IsActive: true },
                order: { StepName: "ASC" as const }
            });
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }

    static async createSalaryStep(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(SalaryStep);
            const result = await repo.save(repo.create(req.body));
            res.status(201).json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }

    static async updateSalaryStep(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(SalaryStep);
            const item = await repo.findOneBy({ StepID: parseInt(req.params.id as string) });
            if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy" });
            repo.merge(item, req.body);
            res.status(200).json({ success: true, data: await repo.save(item) });
        } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
    }

    static async deleteSalaryStep(req: Request, res: Response) {
        await SAFELY_DELETE(AppDataSource.getRepository(SalaryStep), parseInt(req.params.id as string), res);
    }
}