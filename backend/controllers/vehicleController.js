import { Vehicle } from '../models/index.js';
import { Op } from 'sequelize';

export const getAllVehicles = async (req, res) => {
    try {
        // Auto-update status for overdue vehicles
        const today = new Date().toISOString().split('T')[0];

        // Find overdue active vehicles and update them
        await Vehicle.update(
            { status: 'out_of_service' },
            {
                where: {
                    nextService: { [Op.lt]: today },
                    status: 'active'
                }
            }
        );

        const vehicles = await Vehicle.findAll({
            include: ['assignedDriver']
        });
        if (vehicles.length > 0) {
            console.log('[DEBUG] First vehicle data:', JSON.stringify(vehicles[0].toJSON(), null, 2));
        }
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id, {
            include: ['assignedDriver']
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
    }
};

export const createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        // Assuming assignDriverId is passed in, if needed reload with association
        let vehicleWithDriver = vehicle;
        if (req.body.assignedDriverId) {
            vehicleWithDriver = await Vehicle.findByPk(vehicle.id, {
                include: ['assignedDriver']
            });
        }
        res.status(201).json(vehicleWithDriver);
    } catch (error) {
        res.status(400).json({ message: 'Error creating vehicle', error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const [updated] = await Vehicle.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedVehicle = await Vehicle.findByPk(req.params.id, {
                include: ['assignedDriver']
            });
            return res.json(updatedVehicle);
        }
        throw new Error('Vehicle not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating vehicle', error: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const deleted = await Vehicle.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Vehicle deleted successfully' });
        }
        throw new Error('Vehicle not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting vehicle', error: error.message });
    }
};
