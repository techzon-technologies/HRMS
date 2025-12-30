import express from 'express';
import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense
} from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all expense routes
router.use(protect);

router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);
router.post('/', createExpense);
router.put('/:id', adminOnly, updateExpense);
router.delete('/:id', adminOnly, deleteExpense);
router.patch('/:id/approve', adminOnly, approveExpense);
router.patch('/:id/reject', adminOnly, rejectExpense);

export default router;