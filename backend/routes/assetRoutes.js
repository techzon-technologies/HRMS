import express from 'express';
import { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, assignAsset } from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All asset routes with authentication middleware
router.get('/', protect, getAllAssets);           // Get all assets
router.get('/:id', protect, getAssetById);       // Get asset by ID
router.post('/', protect, createAsset);          // Create new asset
router.put('/:id', protect, updateAsset);        // Update asset
router.delete('/:id', protect, deleteAsset);     // Delete asset
router.patch('/:id/assign', protect, assignAsset); // Assign asset to employee

export default router;