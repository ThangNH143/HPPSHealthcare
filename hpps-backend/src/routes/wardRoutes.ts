// src/routes/wardRoutes.ts
import { Router } from "express";
import { WardController } from "../controllers/WardController";

const router = Router();

// Định nghĩa API endpoints cho Wards
router.get("/wards", WardController.getAllWards);
router.post("/wards", WardController.createWard);
router.put("/wards/:id", WardController.updateWard);
router.delete("/wards/:id", WardController.deleteWard);

export default router;