import { Employee } from '../models/index.js';

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error: error.message });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating employee', error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const [updated] = await Employee.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedEmployee = await Employee.findByPk(req.params.id);
            return res.json(updatedEmployee);
        }
        throw new Error('Employee not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating employee', error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Employee deleted successfully' });
        }
        throw new Error('Employee not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting employee', error: error.message });
    }
};
