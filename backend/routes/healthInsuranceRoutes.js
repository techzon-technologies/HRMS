import express from 'express';
import { getAllHealthInsurances, getHealthInsuranceById, createHealthInsurance, updateHealthInsurance, deleteHealthInsurance, updateHealthInsuranceStatus } from '../controllers/healthInsuranceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllHealthInsurances);
router.post('/', protect, createHealthInsurance);
router.get('/:id', protect, getHealthInsuranceById);
router.put('/:id', protect, updateHealthInsurance);
router.delete('/:id', protect, deleteHealthInsurance);

router.put('/:id/status', protect, updateHealthInsuranceStatus);

export default router;