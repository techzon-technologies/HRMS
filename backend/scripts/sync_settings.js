import dotenv from 'dotenv';
dotenv.config();
import { User, CompanySetting } from '../models/index.js';

const syncSettings = async () => {
    try {
        console.log('Syncing User model...');
        await User.sync({ alter: true });
        console.log('User model synced.');

        console.log('Syncing CompanySetting model...');
        await CompanySetting.sync({ alter: true });
        console.log('CompanySetting model synced.');

        process.exit(0);
    } catch (error) {
        console.error('Error syncing settings:', error);
        process.exit(1);
    }
};

syncSettings();
