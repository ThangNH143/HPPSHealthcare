import { Router } from "express";
import { DepartmentController } from "../controllers/DepartmentController";

const router = Router();

router.get("/departments", DepartmentController.getAllDepartments);

export default router;