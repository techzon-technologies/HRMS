
import { DrivingLicence, Employee } from '../models/index.js';

export const getAllLicences = async (req, res) => {
    try {
        const licences = await DrivingLicence.findAll({
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        res.json(licences);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching driving licences', error: error.message });
    }
};

export const getLicenceById = async (req, res) => {
    try {
        const licence = await DrivingLicence.findByPk(req.params.id, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        if (!licence) return res.status(404).json({ message: 'Driving licence not found' });
        res.json(licence);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching driving licence', error: error.message });
    }
};

export const createLicence = async (req, res) => {
    try {
        const licence = await DrivingLicence.create(req.body);
        const licenceWithEmployee = await DrivingLicence.findByPk(licence.id, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        res.status(201).json(licenceWithEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating driving licence', error: error.message });
    }
};

export const updateLicence = async (req, res) => {
    try {
        const [updated] = await DrivingLicence.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedLicence = await DrivingLicence.findByPk(req.params.id, {
                include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
            });
            return res.json(updatedLicence);
        }
        res.status(404).json({ message: 'Driving licence not found' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating driving licence', error: error.message });
    }
};

export const deleteLicence = async (req, res) => {
    try {
        const deleted = await DrivingLicence.destroy({ where: { id: req.params.id } });
        if (deleted) {
            return res.json({ message: 'Driving licence deleted successfully' });
        }
        res.status(404).json({ message: 'Driving licence not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting driving licence', error: error.message });
    }
};
