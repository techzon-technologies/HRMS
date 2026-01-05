
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DrivingLicence = sequelize.define('DrivingLicence', {
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
    licenceNo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'licence_no'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
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
    tableName: 'DrivingLicences'
});

DrivingLicence.associate = (models) => {
    DrivingLicence.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
};

export default DrivingLicence;
