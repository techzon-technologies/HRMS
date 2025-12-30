import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const DisciplinaryAction = sequelize.define('DisciplinaryAction', {
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
    type: {
        type: DataTypes.ENUM('verbal_warning', 'written_warning', 'final_warning', 'suspension', 'termination'),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    incident_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    issued_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'under_review', 'resolved'),
        defaultValue: 'active'
    }
}, {
    tableName: 'DisciplinaryActions',
    timestamps: true
});

// Define associations
DisciplinaryAction.associate = (models) => {
    DisciplinaryAction.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
    DisciplinaryAction.belongsTo(models.Employee, { 
        foreignKey: 'issued_by',
        as: 'issuer'
    });
};

export default DisciplinaryAction;