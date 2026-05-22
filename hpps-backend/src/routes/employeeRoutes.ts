import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController";

const router = Router();

// Định nghĩa các đường dẫn (endpoints)
router.get("/employees", EmployeeController.getAllEmployees);
router.get("/employees/:id", EmployeeController.getEmployeeById);
router.post("/employees", EmployeeController.createEmployee);

export default router;