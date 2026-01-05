import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    checkIn: {
        type: DataTypes.TIME,
        allowNull: true
    },
    checkOut: {
        type: DataTypes.TIME,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'on_leave'),
        defaultValue: 'absent'
    },
    workHours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Attendance'
});

Attendance.associate = (models) => {
    Attendance.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
};

export default Attendance;
