import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CompanySetting = sequelize.define('CompanySetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'My Company'
    },
    companyEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    companyPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timezone: {
        type: DataTypes.STRING,
        defaultValue: 'est'
    },
    workStart: {
        type: DataTypes.STRING,
        defaultValue: '09:00'
    },
    workEnd: {
        type: DataTypes.STRING,
        defaultValue: '17:00'
    }
}, {
    tableName: 'CompanySettings',
    timestamps: true
});

export default CompanySetting;
