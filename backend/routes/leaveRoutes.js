
import express from 'express';
import {
    getAllLeaves,
    getLeaveById,
    createLeave,
    updateLeave,
    deleteLeave,
    approveLeave,
    rejectLeave
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllLeaves);
router.get('/:id', protect, getLeaveById);
router.post('/', protect, createLeave);
router.put('/:id', protect, updateLeave);
router.delete('/:id', protect, deleteLeave);

// Actions
router.patch('/:id/approve', protect, approveLeave);
router.patch('/:id/reject', protect, rejectLeave);

export default router;
