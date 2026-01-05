import sequelize from '../config/database.js';
import { Employee } from '../models/index.js';

const syncEmployees = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Alter table to add departmentId
        await Employee.sync({ alter: true });
        console.log('Employee model synced (alter: true).');

        process.exit(0);
    } catch (error) {
        console.error('Error syncing Employee model:', error);
        process.exit(1);
    }
};

syncEmployees();
