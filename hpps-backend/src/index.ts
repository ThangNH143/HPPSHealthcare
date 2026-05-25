import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import provinceRoutes from "./routes/provinceRoutes";
import wardRoutes from './routes/wardRoutes';
import departmentRoutes from "./routes/departmentRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import masterDataRoutes from "./routes/masterDataRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Đăng ký các API Routes
app.use("/api", provinceRoutes);
app.use('/api/', wardRoutes);
app.use("/api", departmentRoutes);
app.use("/api", employeeRoutes);
app.use("/api", masterDataRoutes);

// Khởi tạo kết nối Database
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Kết nối SQL Server thành công!");
        
        app.listen(PORT, () => {
            console.log(`🚀 Backend Server đang chạy tại http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Lỗi kết nối Database:", error);
    });