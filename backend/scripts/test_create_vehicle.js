import dotenv from 'dotenv';
dotenv.config();
import sequelize from '../config/database.js';
import { Vehicle } from '../models/index.js';

const testCreate = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const payload = {
            plateNumber: `TEST-${Date.now()}`,
            make: 'Toyota',
            model: 'Corolla',
            year: '2024',
            status: 'active',
            nextService: '2025-01-01',
            assignedDriverId: null
        };

        console.log('Creating vehicle with:', payload);
        const vehicle = await Vehicle.create(payload);
        console.log('Created Vehicle:', vehicle.toJSON());

        // Fetch it back
        const fetched = await Vehicle.findByPk(vehicle.id);
        console.log('Fetched Vehicle:', fetched.toJSON());

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testCreate();
