import { Router } from "express";
import { ProvinceController } from "../controllers/ProvinceController";

const router = Router();

// Định nghĩa API endpoints
router.get("/provinces", ProvinceController.getAllProvinces);
router.get("/provinces/:provinceId/wards", ProvinceController.getWardsByProvince);

export default router;