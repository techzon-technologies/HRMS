import express from 'express';
import { getAllPerformanceReviews, getPerformanceReviewById, createPerformanceReview, updatePerformanceReview, deletePerformanceReview, updatePerformanceReviewStatus } from '../controllers/performanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllPerformanceReviews);
router.post('/', protect, createPerformanceReview);
router.get('/:id', protect, getPerformanceReviewById);
router.put('/:id', protect, updatePerformanceReview);
router.delete('/:id', protect, deletePerformanceReview);

router.put('/:id/status', protect, updatePerformanceReviewStatus);

export default router;