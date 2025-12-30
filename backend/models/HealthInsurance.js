import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const HealthInsurance = sequelize.define('HealthInsurance', {
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
    policy_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    provider_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    plan_name: {
        type: DataTypes.STRING,
        defaultValue: 'Basic'
    },
    dependents_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    premium_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expiring_soon', 'expired'),
        defaultValue: 'active'
    }
}, {
    tableName: 'HealthInsurance',
    timestamps: true
});

// Define associations
HealthInsurance.associate = (models) => {
    HealthInsurance.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
};

export default HealthInsurance;