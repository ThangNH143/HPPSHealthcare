import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Province } from "./Province";
import { Ward } from "./Ward";
import { Department } from "./Department";
import { Position } from "./Position";
import { JobTitle } from "./JobTitle";
import { SalaryStep } from "./SalaryStep";
// Import các Entity 1-N mới tạo
import { EmpQualification } from "./EmpQualification";
import { EmpDepartment } from "./EmpDepartment";
import { EmpAllowance } from "./EmpAllowance";
import { EmpPosition } from "./EmpPosition";


@Entity("Dim_Employees") // Tên bảng trong SQL Server theo script mới
export class Employee {
    @PrimaryGeneratedColumn({ name: "EmployeeID" })
    EmployeeID!: number;

    @Column({ name: "EmployeeCode", type: "nvarchar", length: 50, unique: true })
    EmployeeCode!: string;

    @Column({ name: "FullName", type: "nvarchar", length: 200 })
    FullName!: string;

    @Column({ name: "Gender", type: "bit", nullable: true })
    Gender!: boolean; // 1: Nam, 0: Nữ

    @Column({ name: "BirthDate", type: "date", nullable: true })
    BirthDate!: Date;

    // --- THÔNG TIN HÀNH CHÍNH & ĐỊNH DANH ---
    @Column({ name: "Ethnicity", type: "nvarchar", length: 50, nullable: true })
    Ethnicity!: string;

    @Column({ name: "Religion", type: "nvarchar", length: 50, nullable: true })
    Religion!: string;

    @Column({ name: "IdentityCardNumber", type: "nvarchar", length: 20, nullable: true })
    IdentityCardNumber!: string;

    @Column({ name: "IdentityCardDate", type: "date", nullable: true })
    IdentityCardDate!: Date;

    @Column({ name: "IdentityCardPlace", type: "nvarchar", length: 200, nullable: true })
    IdentityCardPlace!: string;

    @Column({ name: "PhoneNumber", type: "nvarchar", length: 20, nullable: true })
    PhoneNumber!: string;

    @Column({ name: "Email", type: "nvarchar", length: 100, nullable: true })
    Email!: string;
    
    @Column({ name: "BHYT", type: "nvarchar", length: 20, nullable: true })
    BHYT!: string; // MỚI BỔ SUNG

    @Column({ name: "BHXH", type: "nvarchar", length: 20, nullable: true })
    BHXH!: string; // MỚI BỔ SUNG

    // --- ĐỊA CHÍNH VÀ QUÊ QUÁN ---
    @Column({ name: "BirthPlaceProvinceID", type: "int", nullable: true })
    BirthPlaceProvinceID!: number;

    @Column({ name: "HometownProvinceID", type: "int", nullable: true })
    HometownProvinceID!: number;

    @Column({ name: "CurrentWardID", type: "int", nullable: true })
    CurrentWardID!: number;

    @Column({ name: "HamletAddress", type: "nvarchar", length: "max", nullable: true })
    HamletAddress!: string;

    // --- THÔNG TIN TỔ CHỨC CÔNG TÁC (TRẠNG THÁI HIỆN TẠI) ---
    // Lưu ý: Lịch sử luân chuyển chi tiết sẽ lưu ở Emp_Departments
    @Column({ name: "DepartmentID", type: "int", nullable: true })
    DepartmentID!: number;

    @Column({ name: "PositionID", type: "int", nullable: true })
    PositionID!: number;

    @Column({ name: "EmployeeType", type: "nvarchar", length: 50, nullable: true })
    EmployeeType!: string;

    @Column({ name: "JoinDate", type: "date", nullable: true })
    JoinDate!: Date;

    @Column({ name: "RecruitmentSource", type: "nvarchar", length: 255, nullable: true })
    RecruitmentSource!: string;

    @Column({ name: "ProbationStatus", type: "nvarchar", length: 100, nullable: true })
    ProbationStatus!: string;

    @Column({ name: "ContractURL", type: "nvarchar", length: 500, nullable: true })
    ContractURL!: string;

    // --- THÔNG TIN ĐẢNG ĐOÀN ---
    @Column({ name: "PartyJoinDatePreliminary", type: "date", nullable: true })
    PartyJoinDatePreliminary!: Date;

    @Column({ name: "PartyJoinDateOfficial", type: "date", nullable: true })
    PartyJoinDateOfficial!: Date;

    @Column({ name: "PartyCardNumber", type: "nvarchar", length: 50, nullable: true })
    PartyCardNumber!: string;

    @Column({ name: "PartyCardIssueDate", type: "date", nullable: true })
    PartyCardIssueDate!: Date;

    @Column({ name: "PartyCell", type: "nvarchar", length: 255, nullable: true })
    PartyCell!: string;

    // --- QUẢN LÝ TIỀN LƯƠNG & LIÊN KẾT DANH MỤC ---
    @Column({ name: "JobTitleID", type: "int", nullable: true })
    JobTitleID!: number;

    @Column({ name: "SalaryStepID", type: "int", nullable: true })
    SalaryStepID!: number;

    @Column({ name: "SalaryStartDate", type: "date", nullable: true })
    SalaryStartDate!: Date;

    @Column({ name: "EarlyPromotionMonths", type: "int", default: 0 })
    EarlyPromotionMonths!: number;

    @Column({ name: "IsOverLimit", type: "bit", default: 0 })
    IsOverLimit!: boolean;

    @Column({ name: "OverLimitPercentage", type: "decimal", precision: 5, scale: 2, nullable: true })
    OverLimitPercentage!: number;

    // --- THI ĐUA KHEN THƯỞNG & GHI CHÚ ---
    @Column({ name: "CommemorativeMedal", type: "nvarchar", length: 255, nullable: true })
    CommemorativeMedal!: string;

    @Column({ name: "EmulationTitle", type: "nvarchar", length: 255, nullable: true })
    EmulationTitle!: string;

    @Column({ name: "Note", type: "nvarchar", length: "max", nullable: true })
    Note!: string;

    @CreateDateColumn({ name: "CreatedAt" })
    CreatedAt!: Date;

    @Column({ name: "IsActive", type: "bit", default: 1 })
    IsActive!: boolean;
    
    // --- THÔNG TIN CHỨNG CHỈ HÀNH NGHỀ (CCHN) ---
    @Column({ name: "LicenseNumber", type: "nvarchar", length: 100, nullable: true })
    LicenseNumber!: string;

    @Column({ name: "LicenseDate", type: "date", nullable: true })
    LicenseDate!: Date;

    @Column({ name: "LicenseEndDate", type: "date", nullable: true })
    LicenseEndDate!: Date;

    // =========================================================
    // THIẾT LẬP MỐI QUAN HỆ ĐỂ TRUY VẤN (RELATIONS)
    // =========================================================
    
    // --- N-1 (Many-to-One): Danh mục cơ bản ---
    @ManyToOne(() => Department)
    @JoinColumn({ name: "DepartmentID" })
    department!: Department;

    @ManyToOne(() => Position)
    @JoinColumn({ name: "PositionID" })
    position!: Position;

    @ManyToOne(() => JobTitle)
    @JoinColumn({ name: "JobTitleID" })
    jobTitle!: JobTitle;

    @ManyToOne(() => SalaryStep)
    @JoinColumn({ name: "SalaryStepID" })
    salaryStep!: SalaryStep;

    @ManyToOne(() => Ward)
    @JoinColumn({ name: "CurrentWardID" })
    currentWard!: Ward;

    // --- 1-N (One-to-Many): Lịch sử & Quá trình công tác (KIẾN TRÚC MỚI) ---
    @OneToMany(() => EmpQualification, (qual) => qual.employee, { cascade: true })
    qualifications!: EmpQualification[];

    @OneToMany(() => EmpDepartment, (dept) => dept.employee, { cascade: true })
    departments!: EmpDepartment[];

    @OneToMany(() => EmpPosition, (pos) => pos.employee, { cascade: true })
    positions!: EmpPosition[];

    @OneToMany(() => EmpAllowance, (allow) => allow.employee, { cascade: true })
    allowances!: EmpAllowance[];

}