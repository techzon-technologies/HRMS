import { Op } from 'sequelize';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();

        // Calculate employee count for each department
        const departmentsWithCount = await Promise.all(departments.map(async (dept) => {
            const count = await Employee.count({
                where: {
                    [Op.or]: [
                        { departmentId: dept.id },
                        { department: dept.name }
                    ]
                }
            });
            return {
                ...dept.toJSON(),
                employees: count
            };
        }));

        res.json(departmentsWithCount);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const count = await Employee.count({
            where: {
                [Op.or]: [
                    { departmentId: department.id },
                    { department: department.name }
                ]
            }
        });

        res.json({ ...department.toJSON(), employees: count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching department', error: error.message });
    }
};

export const createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ ...department.toJSON(), employees: 0 });
    } catch (error) {
        res.status(400).json({ message: 'Error creating department', error: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const [updated] = await Department.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedDepartment = await Department.findByPk(req.params.id);
            const count = await Employee.count({
                where: {
                    [Op.or]: [
                        { departmentId: updatedDepartment.id },
                        { department: updatedDepartment.name }
                    ]
                }
            });
            return res.json({ ...updatedDepartment.toJSON(), employees: count });
        }
        throw new Error('Department not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating department', error: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const deleted = await Department.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Department deleted successfully' });
        }
        throw new Error('Department not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting department', error: error.message });
    }
};
