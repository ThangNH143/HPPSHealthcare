// src/controllers/WardController.ts
import { Request, Response } from "express";
// TODO: Bạn nhớ import đúng AppDataSource từ file config của bạn (có thể ở thư mục config hoặc utils)
import { AppDataSource } from "../config/database"; // <-- Điều chỉnh lại đường dẫn này nếu cần
import { Ward } from "../entities/Ward";

export class WardController {
    // 1. Lấy danh sách tất cả Phường/Xã
    static async getAllWards(req: Request, res: Response) {
        try {
            const wardRepo = AppDataSource.getRepository(Ward);
            const wards = await wardRepo.find({
                order: { WardID: 'DESC' }
            });
            // Trả về trực tiếp mảng (hoặc bọc trong { data: wards } tuỳ thuộc frontend của bạn đang parse thế nào)
            res.json({success: true, data: wards});
        } catch (error) {
            console.error("Lỗi get getAllWards:", error);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách Phường/Xã" });
        }
    }

    // 2. Thêm mới
    static async createWard(req: Request, res: Response) {
        try {
            const wardRepo = AppDataSource.getRepository(Ward);
            const newWard = wardRepo.create(req.body);
            await wardRepo.save(newWard);
            res.json({ success: true, data: newWard });
        } catch (error) {
            console.error("Lỗi createWard:", error);
            res.status(500).json({ message: "Lỗi khi thêm mới Phường/Xã" });
        }
    }

    // 3. Cập nhật
    static async updateWard(req: Request, res: Response) {
        try {
            const wardRepo = AppDataSource.getRepository(Ward);
            const id = Number(req.params.id);
            await wardRepo.update(id, req.body);
            res.json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            console.error("Lỗi updateWard:", error);
            res.status(500).json({ message: "Lỗi khi cập nhật Phường/Xã" });
        }
    }

    // 4. Xóa
    static async deleteWard(req: Request, res: Response) {
        try {
            const wardRepo = AppDataSource.getRepository(Ward);
            const id = Number(req.params.id);
            await wardRepo.delete(id);
            res.json({ success: true, message: "Xóa thành công" });
        } catch (error) {
            console.error("Lỗi deleteWard:", error);
            res.status(500).json({ message: "Lỗi khi xóa Phường/Xã" });
        }
    }
}