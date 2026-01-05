
import express from 'express';
import { getAllLicences, getLicenceById, createLicence, updateLicence, deleteLicence } from '../controllers/drivingLicenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllLicences);
router.get('/:id', protect, getLicenceById);
router.post('/', protect, createLicence);
router.put('/:id', protect, updateLicence);
router.delete('/:id', protect, deleteLicence);

export default router;
