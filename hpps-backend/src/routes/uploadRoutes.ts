import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// 1. Đảm bảo thư mục lưu trữ tồn tại
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Đổi tên file: timestamp + số ngẫu nhiên + đuôi file gốc (.pdf, .jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Giới hạn file 10MB

// 3. API xử lý Upload
router.post("/", upload.single("file"), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file được tải lên" });
        }
        // Trả về đường dẫn tương đối để lưu vào DB
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("Lỗi upload:", error);
        res.status(500).json({ success: false, message: "Lỗi Server khi upload file" });
    }
});

export default router;