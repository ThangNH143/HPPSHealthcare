import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Province } from "./Province";

@Entity("Dim_Wards")
export class Ward {
    @PrimaryColumn({ name: "WardID" })
    WardID!: number;

    @Column({ name: "ProvinceID" })
    ProvinceID!: number;

    @Column({ name: "WardCode", type: "nvarchar", length: 50, nullable: true })
    WardCode!: string;

    @Column({ name: "WardName", type: "nvarchar", length: 100 })
    WardName!: string;

    // Liên kết Nhiều Phường/Xã thuộc về 1 Tỉnh
    @ManyToOne(() => Province, province => province.wards)
    @JoinColumn({ name: "ProvinceID" })
    province!: Province;
}