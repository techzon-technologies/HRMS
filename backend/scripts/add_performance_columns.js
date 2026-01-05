import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database.js';

const addPerformanceColumns = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Add new columns to PerformanceReviews table
        const columnsToAdd = [
            { name: 'department', sql: "ALTER TABLE PerformanceReviews ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL" },
            { name: 'review_period', sql: "ALTER TABLE PerformanceReviews ADD COLUMN IF NOT EXISTS review_period VARCHAR(255) NULL" },
            { name: 'goals', sql: "ALTER TABLE PerformanceReviews ADD COLUMN IF NOT EXISTS goals INT DEFAULT 0" },
            { name: 'completed', sql: "ALTER TABLE PerformanceReviews ADD COLUMN IF NOT EXISTS completed INT DEFAULT 0" },
        ];

        for (const col of columnsToAdd) {
            try {
                // First check if column exists
                const [results] = await sequelize.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'PerformanceReviews' 
                    AND COLUMN_NAME = '${col.name}'
                `);
                
                if (results.length === 0) {
                    await sequelize.query(`ALTER TABLE PerformanceReviews ADD COLUMN ${col.name} ${col.name === 'goals' || col.name === 'completed' ? 'INT DEFAULT 0' : 'VARCHAR(255) NULL'}`);
                    console.log(`Added column: ${col.name}`);
                } else {
                    console.log(`Column ${col.name} already exists, skipping.`);
                }
            } catch (err) {
                console.log(`Error or column ${col.name} might already exist:`, err.message);
            }
        }

        // Update status ENUM to include 'in_progress' if needed
        try {
            await sequelize.query("ALTER TABLE PerformanceReviews MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'acknowledged') DEFAULT 'scheduled'");
            console.log('Updated status ENUM.');
        } catch (err) {
            console.log('Status ENUM update skipped or already exists:', err.message);
        }

        // Make reviewer_id nullable
        try {
            await sequelize.query("ALTER TABLE PerformanceReviews MODIFY COLUMN reviewer_id INT NULL");
            console.log('Made reviewer_id nullable.');
        } catch (err) {
            console.log('reviewer_id update skipped:', err.message);
        }

        console.log('All columns added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error adding columns:', error);
        process.exit(1);
    }
};

addPerformanceColumns();
