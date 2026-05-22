import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Dim_JobTitles")
export class JobTitle {
    @PrimaryGeneratedColumn({ name: "JobTitleID" })
    JobTitleID!: number;

    @Column({ name: "JobTitleName", type: "nvarchar", length: 255 })
    JobTitleName!: string;

    @Column({ name: "GradeID", type: "int", nullable: true })
    GradeID!: number;

    @Column({ name: "Description", type: "nvarchar", nullable: true })
    Description!: string;
}