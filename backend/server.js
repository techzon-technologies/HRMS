import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import './models/index.js'; // Ensure models are loaded

// Route Imports
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import benefitRoutes from './routes/benefitRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import disciplinaryRoutes from './routes/disciplinaryRoutes.js';
import healthInsuranceRoutes from './routes/healthInsuranceRoutes.js';
import complianceAuditRoutes from './routes/complianceAuditRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import visaRoutes from './routes/visaRoutes.js';
import drivingLicenceRoutes from './routes/drivingLicenceRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3018; // Backend server still runs on port 3018, domain routing handled by reverse proxy

// Middleware
// Configure CORS to allow requests from the frontend domain
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8099', 'https://hrmsbackend.webby.one', 'https://hrms.webby.one'], // Add your frontend domain here
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/benefits', benefitRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/health-insurance', healthInsuranceRoutes);
app.use('/api/compliance', complianceAuditRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/driving-licences', drivingLicenceRoutes);
app.use('/api/settings', settingRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('HRMS API is running...');
});

// Database Sync and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Sync models
        // Reverted alter: true to fix ER_TOO_MANY_KEYS error
        // Will handle Asset schema update separately
        await sequelize.sync();
        console.log('Database synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            // console.log(`Domain configured for: hrmsbackend.webby.one (requires reverse proxy setup)`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
