import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("Dim_Departments")
export class Department {
    @PrimaryColumn({ name: "DepartmentID" })
    DepartmentID!: number;

    @Column({ name: "DepartmentCode", type: "nvarchar", length: 50, nullable: true })
    DepartmentCode!: string;

    @Column({ name: "DepartmentName", type: "nvarchar", length: 255 })
    DepartmentName!: string;
}