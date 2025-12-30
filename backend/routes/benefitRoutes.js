import express from 'express';
import { getAllBenefits, getBenefitById, createBenefit, updateBenefit, deleteBenefit } from '../controllers/benefitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllBenefits);
router.post('/', protect, createBenefit);
router.get('/:id', protect, getBenefitById);
router.put('/:id', protect, updateBenefit);
router.delete('/:id', protect, deleteBenefit);

export default router;