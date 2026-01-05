import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database.js';

const checkSchema = async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("DESCRIBE Vehicles;");
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSchema();
