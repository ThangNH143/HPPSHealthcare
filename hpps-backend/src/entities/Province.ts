import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Ward } from "./Ward";

@Entity("Dim_Provinces")
export class Province {
    @PrimaryColumn({ name: "ProvinceID" })
    ProvinceID!: number;

    @Column({ name: "ProvinceCode", type: "nvarchar", length: 50, nullable: true })
    ProvinceCode!: string;

    @Column({ name: "ProvinceName", type: "nvarchar", length: 100 })
    ProvinceName!: string;

    // Liên kết 1 Tỉnh có nhiều Phường/Xã
    @OneToMany(() => Ward, ward => ward.province)
    wards!: Ward[];
}