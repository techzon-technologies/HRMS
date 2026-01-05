import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.STRING,
        allowNull: true
    },
    make: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Unknown'
    },
    plateNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'plate_number'
    },
    type: {
        type: DataTypes.ENUM('car', 'truck', 'bike', 'van'),
        defaultValue: 'car'
    },
    status: {
        type: DataTypes.ENUM('active', 'maintenance', 'out_of_service'),
        defaultValue: 'active'
    },
    nextService: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'next_service'
    },
    assignedDriverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_driver_id',
        references: {
            model: 'Employees',
            key: 'id'
        }
    }
}, {
    tableName: 'Vehicles'
});

Vehicle.associate = (models) => {
    Vehicle.belongsTo(models.Employee, { foreignKey: 'assignedDriverId', as: 'assignedDriver' });
};

export default Vehicle;
