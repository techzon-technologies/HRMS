import { Attendance } from '../models/index.js';

export const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findAll({
            include: ['employee']
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

export const getAttendanceById = async (req, res) => {
    try {
        const record = await Attendance.findByPk(req.params.id, {
            include: ['employee']
        });
        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance record', error: error.message });
    }
};

export const createAttendance = async (req, res) => {
    try {
        const record = await Attendance.create(req.body);
        const recordWithEmployee = await Attendance.findByPk(record.id, {
            include: ['employee']
        });
        res.status(201).json(recordWithEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating attendance record', error: error.message });
    }
};

export const updateAttendance = async (req, res) => {
    try {
        const [updated] = await Attendance.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedRecord = await Attendance.findByPk(req.params.id, {
                include: ['employee']
            });
            return res.json(updatedRecord);
        }
        throw new Error('Attendance record not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating attendance record', error: error.message });
    }
};

export const deleteAttendance = async (req, res) => {
    try {
        const deleted = await Attendance.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Attendance record deleted successfully' });
        }
        throw new Error('Attendance record not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting attendance record', error: error.message });
    }
};
