import express from 'express';
import { getAllComplianceAudits, getComplianceAuditById, createComplianceAudit, updateComplianceAudit, deleteComplianceAudit, updateComplianceAuditStatus } from '../controllers/complianceAuditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getAllComplianceAudits);
router.post('/', protect, createComplianceAudit);
router.get('/:id', protect, getComplianceAuditById);
router.put('/:id', protect, updateComplianceAudit);
router.delete('/:id', protect, deleteComplianceAudit);

router.put('/:id/status', protect, updateComplianceAuditStatus);

export default router;