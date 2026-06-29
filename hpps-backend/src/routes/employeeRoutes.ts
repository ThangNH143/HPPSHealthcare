import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController";

const router = Router();

// Định nghĩa các đường dẫn (endpoints)
router.get("/employees", EmployeeController.getAllEmployees);
router.get("/employees/export", EmployeeController.exportEmployees);
router.get("/employees/:id/dashboard", EmployeeController.getEmployeeDashboard);
router.get("/employees/:id", EmployeeController.getEmployeeById);
router.post("/employees", EmployeeController.createEmployee);
router.put("/employees/:id", EmployeeController.updateEmployee);

export default router;