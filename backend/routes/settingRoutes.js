import express from 'express';
import { getCompanySettings, updateCompanySettings, updateUserSettings } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/company', protect, getCompanySettings);
router.put('/company', protect, authorize('admin', 'manager'), updateCompanySettings); // Only admin/manager can update company info
router.put('/user', protect, updateUserSettings);

export default router;
