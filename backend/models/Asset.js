import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const Asset = sequelize.define('Asset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serial_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    type: {
        type: DataTypes.ENUM('electronics', 'furniture', 'vehicle', 'other'),
        allowNull: true
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Employee,
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    status: {
        type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'scrapped'),
        defaultValue: 'available'
    }
}, {
    tableName: 'Assets',
    timestamps: true
});

// Define associations
Asset.associate = (models) => {
    Asset.belongsTo(models.Employee, { 
        foreignKey: 'assigned_to',
        as: 'employee'
    });
};

export default Asset;