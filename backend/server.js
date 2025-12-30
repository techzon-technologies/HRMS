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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3018;

// Middleware
app.use(cors());
app.use(express.json());

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
        // In production, you might want to use migrations instead of { alter: true }
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
