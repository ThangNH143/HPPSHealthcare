import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Province } from "./Province";
import { Ward } from "./Ward";
import { Department } from "./Department";
import { Position } from "./Position";
import { JobTitle } from "./JobTitle";
import { SalaryStep } from "./SalaryStep";

@Entity("Employees")
export class Employee {
    @PrimaryGeneratedColumn({ name: "EmployeeID" })
    EmployeeID!: number;

    @Column({ name: "EmployeeCode", type: "nvarchar", length: 50, unique: true })
    EmployeeCode!: string; // Mã hồ sơ (Ví dụ trong file: T313)

    @Column({ name: "FullName", type: "nvarchar", length: 200 })
    FullName!: string;

    @Column({ name: "Gender", type: "bit", nullable: true })
    Gender!: boolean; // 1: Nam, 0: Nữ

    @Column({ name: "BirthDate", type: "date", nullable: true })
    BirthDate!: Date;

    // --- THÔNG TIN HÀNH CHÍNH & CCCD ---
    @Column({ name: "Ethnicity", type: "nvarchar", length: 50, nullable: true })
    Ethnicity!: string; // Dân tộc

    @Column({ name: "Religion", type: "nvarchar", length: 50, nullable: true })
    Religion!: string; // Tôn giáo

    @Column({ name: "IdentityCardNumber", type: "nvarchar", length: 20, nullable: true })
    IdentityCardNumber!: string; // Số CCCD

    @Column({ name: "IdentityCardDate", type: "date", nullable: true })
    IdentityCardDate!: Date;

    @Column({ name: "IdentityCardPlace", type: "nvarchar", length: 200, nullable: true })
    IdentityCardPlace!: string;

    @Column({ name: "PhoneNumber", type: "nvarchar", length: 20, nullable: true })
    PhoneNumber!: string;

    // --- ĐỊA CHÍNH VÀ QUÊ QUÁN ---
    @Column({ name: "BirthPlaceProvinceID", type: "int", nullable: true })
    BirthPlaceProvinceID!: number; // Nơi sinh (Tỉnh)

    @Column({ name: "HometownProvinceID", type: "int", nullable: true })
    HometownProvinceID!: number; // Quê quán (Tỉnh)

    @Column({ name: "CurrentWardID", type: "int", nullable: true })
    CurrentWardID!: number; // Nơi ở hiện tại (Phường/Xã)

    @Column({ name: "HamletAddress", type: "nvarchar", length: "max", nullable: true })
    HamletAddress!: string; // Số nhà, tên đường, ấp cụ thể

    // --- TRÌNH ĐỘ CHUYÊN MÔN & ĐÀO TẠO ---
    @Column({ name: "Specialty", type: "nvarchar", length: 255, nullable: true })
    Specialty!: string; // Chuyên môn sâu (Ví dụ: Cử nhân Luật Kinh tế, Bác sĩ Đa khoa)

    @Column({ name: "EducationLevel", type: "nvarchar", length: 100, nullable: true })
    EducationLevel!: string; // Phân loại trình độ (Đại học, Thạc sĩ, CK1...)

    @Column({ name: "GraduationSchool", type: "nvarchar", length: 255, nullable: true })
    GraduationSchool!: string;

    @Column({ name: "GraduationYear", type: "int", nullable: true })
    GraduationYear!: number;

    @Column({ name: "GraduationScore", type: "nvarchar", length: 50, nullable: true })
    GraduationScore!: string; // Điểm/Xếp loại tốt nghiệp

    @Column({ name: "ForeignLanguage", type: "nvarchar", length: 100, nullable: true })
    ForeignLanguage!: string; // Ngoại ngữ

    @Column({ name: "ITSkill", type: "nvarchar", length: 100, nullable: true })
    ITSkill!: string; // Tin học

    @Column({ name: "PoliticsLevel", type: "nvarchar", length: 100, nullable: true })
    PoliticsLevel!: string; // Trình độ Chính trị (Sơ cấp, Trung cấp, Cao cấp)

    @Column({ name: "DefenseEducation", type: "nvarchar", length: 100, nullable: true })
    DefenseEducation!: string; // An ninh quốc phòng (ANQP)

    // --- THÔNG TIN TỔ CHỨC CÔNG TÁC ---
    @Column({ name: "DepartmentID", type: "int", nullable: true })
    DepartmentID!: number;

    @Column({ name: "PositionID", type: "int", nullable: true })
    PositionID!: number; // Chức vụ quản lý

    @Column({ name: "EmployeeType", type: "nvarchar", length: 50, nullable: true })
    EmployeeType!: string; // Biên chế / HĐ 111

    @Column({ name: "JoinDate", type: "date", nullable: true })
    JoinDate!: Date; // Ngày vào làm

    @Column({ name: "RecruitmentSource", type: "nvarchar", length: 255, nullable: true })
    RecruitmentSource!: string; // Nguồn tuyển dụng / Cơ quan tuyển dụng

    @Column({ name: "ProbationStatus", type: "nvarchar", length: 100, nullable: true })
    ProbationStatus!: string; // Trạng thái tập sự

    // --- CHỨNG CHỈ HÀNH NGHỀ (CCHN Y TẾ) ---
    @Column({ name: "LicenseNumber", type: "nvarchar", length: 100, nullable: true })
    LicenseNumber!: string;

    @Column({ name: "LicenseDate", type: "date", nullable: true })
    LicenseDate!: Date;

    @Column({ name: "LicensePlace", type: "nvarchar", length: 255, nullable: true })
    LicensePlace!: string;

    @Column({ name: "LicenseStartDate", type: "date", nullable: true })
    LicenseStartDate!: Date;

    @Column({ name: "LicenseEndDate", type: "date", nullable: true })
    LicenseEndDate!: Date;

    // --- CHỨNG CHỈ QUẢN LÝ ---
    @Column({ name: "ManagementCertName", type: "nvarchar", length: 255, nullable: true })
    ManagementCertName!: string; // Tên lớp quản lý (QLNN/QLBV/QTBV...)

    @Column({ name: "ManagementCertNumber", type: "nvarchar", length: 100, nullable: true })
    ManagementCertNumber!: string;

    @Column({ name: "ManagementCertDate", type: "date", nullable: true })
    ManagementCertDate!: Date;

    @Column({ name: "ManagementCertPlace", type: "nvarchar", length: 255, nullable: true })
    ManagementCertPlace!: string;

    // --- THÔNG TIN ĐẢNG ĐOÀN ---
    @Column({ name: "PartyJoinDatePreliminary", type: "date", nullable: true })
    PartyJoinDatePreliminary!: Date; // Ngày vào Đảng dự bị

    @Column({ name: "PartyJoinDateOfficial", type: "date", nullable: true })
    PartyJoinDateOfficial!: Date; // Ngày vào Đảng chính thức

    @Column({ name: "PartyCardNumber", type: "nvarchar", length: 50, nullable: true })
    PartyCardNumber!: string;

    @Column({ name: "PartyCell", type: "nvarchar", length: 255, nullable: true })
    PartyCell!: string; // Chi bộ khối

    // --- QUẢN LÝ TIỀN LƯƠNG & LIÊN KẾT DANH MỤC ---
    @Column({ name: "JobTitleID", type: "int", nullable: true })
    JobTitleID!: number; // Liên kết chức danh nghề nghiệp

    @Column({ name: "SalaryStepID", type: "int", nullable: true })
    SalaryStepID!: number; // Liên kết bậc lương & hệ số lương tương ứng

    @Column({ name: "SalaryStartDate", type: "date", nullable: true })
    SalaryStartDate!: Date; // Ngày bắt đầu hưởng bậc lương hiện tại

    @Column({ name: "EarlyPromotionMonths", type: "int", default: 0 })
    EarlyPromotionMonths!: number; // Số tháng nâng lương trước hạn (nhập tay theo tháng)

    @Column({ name: "IsOverLimit", type: "bit", default: 0 })
    IsOverLimit!: boolean; // Vượt khung (True/False)

    @Column({ name: "OverLimitPercentage", type: "decimal", precision: 5, scale: 2, nullable: true })
    OverLimitPercentage!: number; // % Vượt khung

    // --- THI ĐUA KHEN THƯỞNG & GHI CHÚ ---
    @Column({ name: "CommemorativeMedal", type: "nvarchar", length: 255, nullable: true })
    CommemorativeMedal!: string; // Kỷ niệm chương

    @Column({ name: "EmulationTitle", type: "nvarchar", length: 255, nullable: true })
    EmulationTitle!: string; // Chiến sĩ thi đua

    @Column({ name: "Note", type: "nvarchar", length: "max", nullable: true })
    Note!: string;

    // --- THIẾT LẬP MỐI QUAN HỆ ĐỂ TRUY VẤN (RELATIONS) ---
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
}