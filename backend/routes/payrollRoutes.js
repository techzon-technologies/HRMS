import express from 'express';
import { getAllPayrolls, getPayrollById, createPayroll, updatePayroll, deletePayroll, processPayroll } from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllPayrolls);
router.post('/', protect, createPayroll);
router.get('/:id', protect, getPayrollById);
router.put('/:id', protect, updatePayroll);
router.delete('/:id', protect, deletePayroll);

router.put('/:id/process', protect, processPayroll);

export default router;