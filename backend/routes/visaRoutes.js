
import express from 'express';
import { getAllVisas, getVisaById, createVisa, updateVisa, deleteVisa } from '../controllers/visaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllVisas);
router.get('/:id', protect, getVisaById);
router.post('/', protect, createVisa);
router.put('/:id', protect, updateVisa);
router.delete('/:id', protect, deleteVisa);

export default router;
