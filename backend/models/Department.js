import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    head: {
        type: DataTypes.STRING,
        allowNull: true
    },
    openPositions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'open_positions'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: 'bg-primary'
    }
}, {
    tableName: 'Departments'
});

export default Department;
