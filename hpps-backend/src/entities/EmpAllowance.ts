import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee";

@Entity("Emp_Allowances")
export class EmpAllowance {
    @PrimaryGeneratedColumn({ name: "EmpAllowID" })
    EmpAllowID: number;

    @Column({ name: "EmployeeID" })
    EmployeeID: number;

    @Column({ name: "AllowanceTypeID" })
    AllowanceTypeID: number;

    @Column({ name: "Value", type: "decimal", precision: 18, scale: 4 })
    Value: number;

    @Column({ name: "ValidFrom", type: "date" })
    ValidFrom: Date;

    @Column({ name: "ValidTo", type: "date", nullable: true })
    ValidTo: Date;

    @Column({ name: "Notes", length: 200, nullable: true })
    Notes: string;

    @ManyToOne(() => Employee, (emp) => emp.allowances)
    @JoinColumn({ name: "EmployeeID" })
    employee: Employee;
}