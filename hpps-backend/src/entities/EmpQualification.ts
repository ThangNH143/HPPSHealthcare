import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee";

@Entity("Emp_Qualifications")
export class EmpQualification {
    @PrimaryGeneratedColumn({ name: "QualID" })
    QualID: number;

    @Column({ name: "EmployeeID" })
    EmployeeID: number;

    @Column({ name: "QualType", length: 50, nullable: true })
    QualType: string;

    @Column({ name: "QualName", length: 200, nullable: true })
    QualName: string;

    @Column({ name: "IssuePlace", length: 200, nullable: true })
    IssuePlace: string;

    @Column({ name: "IssueDateText", length: 50, nullable: true })
    IssueDateText: string; // User nhập tự do: "10/2020", "2015"

    @Column({ name: "ParsedDate", type: "date", nullable: true })
    ParsedDate: Date; // Dành cho hệ thống chạy cảnh báo

    @Column({ name: "AttachmentURL", length: 500, nullable: true })
    AttachmentURL: string;

    @Column({ name: "IsActive", default: true })
    IsActive: boolean;

    // --- QUAN HỆ N-1 (MANY-TO-ONE) ---
    @ManyToOne(() => Employee, (emp) => emp.qualifications)
    @JoinColumn({ name: "EmployeeID" })
    employee: Employee;
}