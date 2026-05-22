import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Dim_SalarySteps")
export class SalaryStep {
    @PrimaryGeneratedColumn({ name: "StepID" })
    StepID!: number;

    @Column({ name: "GradeID", type: "int", nullable: true })
    GradeID!: number;

    @Column({ name: "StepName", type: "nvarchar", length: 50, nullable: true })
    StepName!: string;

    @Column({ name: "Coefficient", type: "decimal", precision: 18, scale: 3, nullable: true })
    Coefficient!: number;

    @Column({ name: "IsDefault", type: "bit", default: 0 })
    IsDefault!: boolean;
}