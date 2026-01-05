import dotenv from 'dotenv';
dotenv.config();
import sequelize from '../config/database.js';
import { CompanySetting } from '../models/index.js';

const safeSyncSettings = async () => {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();

        console.log('Syncing CompanySetting model...');
        await CompanySetting.sync({ alter: true });
        console.log('CompanySetting model synced.');

        console.log('Checking Users table for preferences column...');
        const [results] = await sequelize.query("SHOW COLUMNS FROM `Users` LIKE 'preferences'");

        if (results.length === 0) {
            console.log('Adding preferences column to Users table...');
            await sequelize.query("ALTER TABLE `Users` ADD COLUMN `preferences` JSON");
            console.log('Column added.');
        } else {
            console.log('preferences column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error syncing settings:', error);
        process.exit(1);
    }
};

safeSyncSettings();
