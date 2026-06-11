import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee";

@Entity("Emp_Departments")
export class EmpDepartment {
    @PrimaryGeneratedColumn({ name: "EmpDeptID" })
    EmpDeptID!: number;

    @Column({ name: "EmployeeID" })
    EmployeeID!: number;

    @Column({ name: "DepartmentID" })
    DepartmentID!: number;

    @Column({ name: "ValidFrom", type: "date" })
    ValidFrom!: Date;

    @Column({ name: "ValidTo", type: "date", nullable: true })
    ValidTo!: Date;

    @Column({ name: "DecisionURL", length: 500, nullable: true })
    DecisionURL!: string;

    @ManyToOne(() => Employee, (emp) => emp.departments)
    @JoinColumn({ name: "EmployeeID" })
    employee!: Employee;
}