import { Employee, Department } from '../models/index.js';

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: [{
                model: Department,
                as: 'departmentData',
                attributes: ['name']
            }]
        });

        const mappedEmployees = employees.map(emp => {
            const empJson = emp.toJSON();
            return {
                ...empJson,
                department: empJson.departmentData ? empJson.departmentData.name : empJson.department
            };
        });

        res.json(mappedEmployees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            include: [{
                model: Department,
                as: 'departmentData',
                attributes: ['name']
            }]
        });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const empJson = employee.toJSON();
        const responseData = {
            ...empJson,
            department: empJson.departmentData ? empJson.departmentData.name : empJson.department
        };
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error: error.message });
    }
};

// Create Employee
export const createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, position, department, departmentId, hireDate, salary, status } = req.body;

        let finalDepartmentId = departmentId;
        let finalDepartmentName = department;

        if (!finalDepartmentId && department) {
            const dept = await Department.findOne({ where: { name: department } });
            if (dept) {
                finalDepartmentId = dept.id;
            }
        }

        const employee = await Employee.create({
            firstName,
            lastName,
            email,
            phone,
            position,
            department: finalDepartmentName,
            departmentId: finalDepartmentId,
            hireDate,
            salary,
            status
        });
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating employee', error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, position, department, departmentId, hireDate, salary, status } = req.body;
        const employee = await Employee.findByPk(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        let finalDepartmentId = departmentId;
        let finalDepartmentName = department;

        if (!finalDepartmentId && department) {
            const dept = await Department.findOne({ where: { name: department } });
            if (dept) {
                finalDepartmentId = dept.id;
            }
        }

        if (departmentId && !department) {
            const dept = await Department.findByPk(departmentId);
            if (dept) {
                finalDepartmentName = dept.name;
            }
        }

        await employee.update({
            firstName,
            lastName,
            email,
            phone,
            position,
            department: finalDepartmentName,
            departmentId: finalDepartmentId,
            hireDate,
            salary,
            status
        });

        return res.json(employee);
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
