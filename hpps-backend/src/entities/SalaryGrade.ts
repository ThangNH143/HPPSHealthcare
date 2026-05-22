import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Dim_SalaryGrades")
export class SalaryGrade {
    @PrimaryGeneratedColumn({ name: "GradeID" })
    GradeID!: number;

    @Column({ name: "GradeCode", type: "nvarchar", length: 50, nullable: true })
    GradeCode!: string;

    @Column({ name: "GradeName", type: "nvarchar", length: 255 })
    GradeName!: string;

    @Column({ name: "HoldingMonths", type: "int", default: 36 })
    HoldingMonths!: number;
}