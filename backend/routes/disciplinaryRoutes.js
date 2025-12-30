import express from 'express';
import { getAllDisciplinaryActions, getDisciplinaryActionById, createDisciplinaryAction, updateDisciplinaryAction, deleteDisciplinaryAction, updateDisciplinaryStatus } from '../controllers/disciplinaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllDisciplinaryActions);
router.post('/', protect, createDisciplinaryAction);
router.get('/:id', protect, getDisciplinaryActionById);
router.put('/:id', protect, updateDisciplinaryAction);
router.delete('/:id', protect, deleteDisciplinaryAction);

router.put('/:id/status', protect, updateDisciplinaryStatus);

export default router;