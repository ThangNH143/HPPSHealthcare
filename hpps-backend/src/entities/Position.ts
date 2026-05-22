import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Dim_Positions")
export class Position {
    @PrimaryGeneratedColumn({ name: "PositionID" })
    PositionID!: number;

    @Column({ name: "PositionName", type: "nvarchar", length: 100 })
    PositionName!: string;
}