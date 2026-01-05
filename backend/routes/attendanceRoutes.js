import express from 'express';
import { getAllAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllAttendance);
router.get('/:id', protect, getAttendanceById);
router.post('/', protect, createAttendance);
router.put('/:id', protect, updateAttendance);
router.delete('/:id', protect, deleteAttendance);

export default router;
