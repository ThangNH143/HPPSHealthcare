import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Province } from "../entities/Province";
import { Ward } from "../entities/Ward";

export class ProvinceController {
    // 1. API lấy danh sách toàn bộ Tỉnh/Thành phố
    static async getAllProvinces(req: Request, res: Response) {
        try {
            const provinceRepository = AppDataSource.getRepository(Province);
            const provinces = await provinceRepository.find({
                order: { ProvinceName: "ASC" as const } // Đã fix: Báo cho TS biết đây là lệnh sắp xếp chuẩn
            });
            res.status(200).json({ success: true, data: provinces });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Tỉnh:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }

    // 2. API lấy danh sách Phường/Xã dựa vào ID Tỉnh
    static async getWardsByProvince(req: Request, res: Response) {
        try {
            // Đã fix: Ép kiểu as string để hàm parseInt hiểu đúng
            const provinceId = parseInt(req.params.provinceId as string);
            const wardRepository = AppDataSource.getRepository(Ward);
            
            const wards = await wardRepository.find({
                where: { ProvinceID: provinceId },
                order: { WardName: "ASC" as const } // Đã fix tương tự
            });
            res.status(200).json({ success: true, data: wards });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách Xã:", error);
            res.status(500).json({ success: false, message: "Lỗi Server" });
        }
    }
}