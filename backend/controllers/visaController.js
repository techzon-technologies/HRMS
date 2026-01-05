
import { Visa, Employee } from '../models/index.js';

export const getAllVisas = async (req, res) => {
    try {
        const visas = await Visa.findAll({
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        res.json(visas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visas', error: error.message });
    }
};

export const getVisaById = async (req, res) => {
    try {
        const visa = await Visa.findByPk(req.params.id, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        if (!visa) return res.status(404).json({ message: 'Visa not found' });
        res.json(visa);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visa', error: error.message });
    }
};

export const createVisa = async (req, res) => {
    try {
        const visa = await Visa.create(req.body);
        const visaWithEmployee = await Visa.findByPk(visa.id, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
        });
        res.status(201).json(visaWithEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating visa', error: error.message });
    }
};

export const updateVisa = async (req, res) => {
    try {
        const [updated] = await Visa.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedVisa = await Visa.findByPk(req.params.id, {
                include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] }]
            });
            return res.json(updatedVisa);
        }
        res.status(404).json({ message: 'Visa not found' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating visa', error: error.message });
    }
};

export const deleteVisa = async (req, res) => {
    try {
        const deleted = await Visa.destroy({ where: { id: req.params.id } });
        if (deleted) {
            return res.json({ message: 'Visa deleted successfully' });
        }
        res.status(404).json({ message: 'Visa not found' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting visa', error: error.message });
    }
};
