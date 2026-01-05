
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Leave = sequelize.define('Leave', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees', // Assumes table name is Employees
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING, // "Annual Leave", "Sick Leave", etc.
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    days: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'Leaves'
});

Leave.associate = (models) => {
    Leave.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
};

export default Leave;
