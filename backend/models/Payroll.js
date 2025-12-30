import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const Payroll = sequelize.define('Payroll', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    base_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    bonus: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    deductions: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processed', 'paid'),
        defaultValue: 'pending'
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    transaction_ref: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'Payrolls',
    timestamps: true
});

// Define associations
Payroll.associate = (models) => {
    Payroll.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
};

export default Payroll;