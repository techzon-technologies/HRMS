
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'firstName', 'lastName', 'department'] // Adjust attributes as needed
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaves', error: error.message });
    }
};

export const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findByPk(req.params.id, {
            include: [{
                model: Employee,
                as: 'employee'
            }]
        });
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave request', error: error.message });
    }
};

export const createLeave = async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, days, reason } = req.body;
        // In a real app, validation logic (e.g., balance check) would go here.

        // For now we assume employeeId comes from frontend list or auth context. 
        // If auth is fully implemented, req.user.id would be safer.
        // Assuming req.body contains valid employeeId.

        const leave = await Leave.create({
            employeeId, // Temporarily manual, should come from auth or selection
            type,
            startDate,
            endDate,
            days,
            reason
        });

        // Fetch to return with employee details
        const createdLeave = await Leave.findByPk(leave.id, {
            include: [{ model: Employee, as: 'employee' }]
        });

        res.status(201).json(createdLeave);
    } catch (error) {
        res.status(400).json({ message: 'Error creating leave request', error: error.message });
    }
};

export const updateLeave = async (req, res) => {
    try {
        const [updated] = await Leave.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedLeave = await Leave.findByPk(req.params.id, {
                include: [{ model: Employee, as: 'employee' }]
            });
            return res.json(updatedLeave);
        }
        throw new Error('Leave request not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating leave request', error: error.message });
    }
};

export const deleteLeave = async (req, res) => {
    try {
        const deleted = await Leave.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Leave request deleted successfully' });
        }
        throw new Error('Leave request not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting leave request', error: error.message });
    }
};

export const approveLeave = async (req, res) => {
    try {
        const [updated] = await Leave.update({ status: 'approved' }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedLeave = await Leave.findByPk(req.params.id, {
                include: [{ model: Employee, as: 'employee' }]
            });
            return res.json(updatedLeave);
        }
        throw new Error('Leave request not found');
    } catch (error) {
        res.status(400).json({ message: 'Error approving leave request', error: error.message });
    }
};

export const rejectLeave = async (req, res) => {
    try {
        const [updated] = await Leave.update({ status: 'rejected' }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedLeave = await Leave.findByPk(req.params.id, {
                include: [{ model: Employee, as: 'employee' }]
            });
            return res.json(updatedLeave);
        }
        throw new Error('Leave request not found');
    } catch (error) {
        res.status(400).json({ message: 'Error rejecting leave request', error: error.message });
    }
};
