
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Visa = sequelize.define('Visa', {
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
    type: {
        type: DataTypes.ENUM('Work Visa', 'Residence Visa', 'Visit Visa'),
        allowNull: false
    },
    visaNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'visa_number'
    },
    issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'issue_date'
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'expiry_date'
    },
    status: {
        type: DataTypes.ENUM('Active', 'Expiring Soon', 'Expired'),
        defaultValue: 'Active'
    }
}, {
    tableName: 'Visas'
});

Visa.associate = (models) => {
    Visa.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
};

export default Visa;
