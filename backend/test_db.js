import { User } from './models/index.js';
import sequelize from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAssetsTable() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful');
        
        // Check the actual structure of the Assets table
        const [assetsColumns] = await sequelize.query("DESCRIBE Assets;");
        console.log('Assets table structure:');
        console.log(JSON.stringify(assetsColumns, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAssetsTable();