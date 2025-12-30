import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const Expense = sequelize.define('Expense', {
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
    category: {
        type: DataTypes.ENUM('travel', 'meals', 'supplies', 'internet', 'other'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    receipt_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
        defaultValue: 'pending'
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Employee,
            key: 'id'
        }
    }
}, {
    tableName: 'Expenses',
    timestamps: true
});

// Define associations
Expense.associate = (models) => {
    Expense.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
    Expense.belongsTo(models.Employee, {
        foreignKey: 'approved_by',
        as: 'approver'
    });
};

export default Expense;