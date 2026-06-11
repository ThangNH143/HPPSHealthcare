import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee";

@Entity("Emp_Positions")
export class EmpPosition {
    @PrimaryGeneratedColumn({ name: "EmpPosID" })
    EmpPosID!: number;

    @Column({ name: "EmployeeID" })
    EmployeeID!: number;

    @Column({ name: "PositionID" })
    PositionID!: number;

    @Column({ name: "ValidFrom", type: "date" })
    ValidFrom!: Date;

    @Column({ name: "ValidTo", type: "date", nullable: true })
    ValidTo!: Date;

    @Column({ name: "DecisionURL", length: 500, nullable: true })
    DecisionURL!: string;

    @ManyToOne(() => Employee, (emp) => emp.positions)
    @JoinColumn({ name: "EmployeeID" })
    employee!: Employee;
}