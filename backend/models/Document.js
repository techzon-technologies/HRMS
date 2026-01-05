import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Document = sequelize.define('Document', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.TEXT('long'), // Use LONGTEXT for Base64 storage
        allowNull: false,
        field: 'file_url'
    },
    expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'expiry_date'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'uploaded_at'
    }
}, {
    tableName: 'Documents'
});

Document.associate = (models) => {
    Document.belongsTo(models.Employee, { foreignKey: 'employeeId', as: 'employee' });
};

export default Document;
