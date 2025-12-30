import express from 'express';
import { 
  generateExpenseReport, 
  generateAssetReport, 
  generateBenefitReport, 
  generatePayrollReport, 
  generateDisciplinaryReport, 
  generateHealthInsuranceReport, 
  generateComplianceReport, 
  generatePerformanceReport,
  generateOverallReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/expenses', protect, generateExpenseReport);
router.get('/assets', protect, generateAssetReport);
router.get('/benefits', protect, generateBenefitReport);
router.get('/payrolls', protect, generatePayrollReport);
router.get('/disciplinary', protect, generateDisciplinaryReport);
router.get('/health-insurance', protect, generateHealthInsuranceReport);
router.get('/compliance', protect, generateComplianceReport);
router.get('/performance', protect, generatePerformanceReport);
router.get('/overall', protect, generateOverallReport);

export default router;