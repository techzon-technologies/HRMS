import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const Benefit = sequelize.define('Benefit', {
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
    years_of_service: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0
    },
    basic_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    gratuity_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('accruing', 'paid_out'),
        defaultValue: 'accruing'
    },
    last_calculated: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'Benefits',
    timestamps: true
});

// Define associations
Benefit.associate = (models) => {
    Benefit.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
};

export default Benefit;