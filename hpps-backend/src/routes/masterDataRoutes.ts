import { Router } from "express";
import { MasterDataController } from "../controllers/MasterDataController";

const router = Router();

// Phòng ban
router.get("/departments", MasterDataController.getDepartments);
router.post("/departments", MasterDataController.createDepartment);
router.put("/departments/:id", MasterDataController.updateDepartment);
router.delete("/departments/:id", MasterDataController.deleteDepartment);

// Chức vụ
router.get("/positions", MasterDataController.getPositions);
router.post("/positions", MasterDataController.createPosition);
router.put("/positions/:id", MasterDataController.updatePosition);
router.delete("/positions/:id", MasterDataController.deletePosition);

// Chức danh nghề nghiệp
router.get("/job-titles", MasterDataController.getJobTitles);
router.post("/job-titles", MasterDataController.createJobTitle);
router.put("/job-titles/:id", MasterDataController.updateJobTitle);
router.delete("/job-titles/:id", MasterDataController.deleteJobTitle);

// Ngạch lương
router.get("/salary-grades", MasterDataController.getSalaryGrades);
router.post("/salary-grades", MasterDataController.createSalaryGrade);
router.put("/salary-grades/:id", MasterDataController.updateSalaryGrade);
router.delete("/salary-grades/:id", MasterDataController.deleteSalaryGrade);

// Bậc lương
router.get("/salary-steps", MasterDataController.getSalarySteps);
router.post("/salary-steps", MasterDataController.createSalaryStep);
router.put("/salary-steps/:id", MasterDataController.updateSalaryStep);
router.delete("/salary-steps/:id", MasterDataController.deleteSalaryStep);

// API Cascading đổ dữ liệu Bậc lương dựa theo Ngạch lương
router.get("/salary-grades/:gradeId/steps", MasterDataController.getSalaryStepsByGrade);

export default router;