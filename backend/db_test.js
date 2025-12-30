import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const passwordsToTry = ['', 'root', 'password', '12345678', 'admin', 'mysql'];
const hostsToTry = ['localhost', '127.0.0.1'];
const portsToTry = [3306, 3307];
const user = process.env.DB_USER || 'root';
const database = process.env.DB_NAME || 'hrms_db';

async function testConnection() {
    for (const host of hostsToTry) {
        for (const port of portsToTry) {
            console.log(`\n--- Testing host: ${host}, port: ${port} ---`);
            for (const password of passwordsToTry) {
                console.log(`Trying password: "${password}"...`);
                try {
                    const connection = await mysql.createConnection({
                        host,
                        port,
                        user,
                        password,
                    });
                    console.log(`✅ Success! Password "${password}" works on ${host}:${port}.`);

                    try {
                        await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
                        console.log(`✅ Database "${database}" ensured.`);
                    } catch (dbError) {
                        console.error(`❌ Connected, but failed to ensure database: ${dbError.message}`);
                    }

                    await connection.end();
                    return;
                } catch (error) {
                    console.error(`❌ Failed: ${error.message}`);
                }
            }
        }
    }

    console.log('\nAll attempted configurations failed.');
    console.log('Please check your MySQL credentials and status.');
}

testConnection();
