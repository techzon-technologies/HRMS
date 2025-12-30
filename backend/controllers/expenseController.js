import { Expense } from '../models/index.js';

export const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: ['employee'] // Include employee details
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id, {
            include: ['employee']
        });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error: error.message });
    }
};

export const createExpense = async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            employee_id: req.user.id // Assuming the user is the employee
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: 'Error creating expense', error: error.message });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const [updated] = await Expense.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedExpense = await Expense.findByPk(req.params.id);
            return res.json(updatedExpense);
        }
        throw new Error('Expense not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense', error: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const deleted = await Expense.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Expense deleted successfully' });
        }
        throw new Error('Expense not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting expense', error: error.message });
    }
};

export const approveExpense = async (req, res) => {
    try {
        const [updated] = await Expense.update(
            { status: 'approved' },
            { where: { id: req.params.id } }
        );
        if (updated) {
            const expense = await Expense.findByPk(req.params.id);
            return res.json(expense);
        }
        throw new Error('Expense not found');
    } catch (error) {
        res.status(400).json({ message: 'Error approving expense', error: error.message });
    }
};

export const rejectExpense = async (req, res) => {
    try {
        const [updated] = await Expense.update(
            { status: 'rejected' },
            { where: { id: req.params.id } }
        );
        if (updated) {
            const expense = await Expense.findByPk(req.params.id);
            return res.json(expense);
        }
        throw new Error('Expense not found');
    } catch (error) {
        res.status(400).json({ message: 'Error rejecting expense', error: error.message });
    }
};