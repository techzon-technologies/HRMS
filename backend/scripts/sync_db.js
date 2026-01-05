import dotenv from 'dotenv';
dotenv.config();


import sequelize from '../config/database.js';
import '../models/index.js';

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Ensure models are loaded
        const { Vehicle, PerformanceReview } = sequelize.models;
        if (!Vehicle) throw new Error('Vehicle model not found');

        await Vehicle.sync({ alter: true });
        console.log('Vehicle table synchronized (alter: true).');

        // Sync PerformanceReview table with new fields
        if (PerformanceReview) {
            await PerformanceReview.sync({ alter: true });
            console.log('PerformanceReview table synchronized (alter: true).');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
};

syncDatabase();
