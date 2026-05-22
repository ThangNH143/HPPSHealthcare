import { DataSource } from "typeorm";
import { Province } from "../entities/Province";
import { Ward } from "../entities/Ward";
import { Department } from "../entities/Department";
import { JobTitle } from "../entities/JobTitle";
import { Position } from "../entities/Position";
import { SalaryGrade } from "../entities/SalaryGrade";
import { SalaryStep } from "../entities/SalaryStep";
import { Employee } from "../entities/Employee";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Province, Ward, Department, JobTitle, Position, SalaryGrade, SalaryStep, Employee] , // Đăng ký các Entity tại đây
    synchronize: false, // Tắt đồng bộ tự động để không làm hỏng Database đã có
    logging: true,
    options: {
        encrypt: false, // Đặt true nếu dùng Azure SQL, false nếu dùng SQL Server local
        trustServerCertificate: true
    }
});