import express from 'express';
import { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllDocuments);
router.get('/:id', protect, getDocumentById);
router.post('/', protect, createDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router;
