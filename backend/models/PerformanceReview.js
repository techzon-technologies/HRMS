import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Employee from './Employee.js';

const PerformanceReview = sequelize.define('PerformanceReview', {
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
    reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    review_period_start: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    review_period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1), // e.g., 4.5
        allowNull: true
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'acknowledged'),
        defaultValue: 'scheduled'
    }
}, {
    tableName: 'PerformanceReviews',
    timestamps: true
});

// Define associations
PerformanceReview.associate = (models) => {
    PerformanceReview.belongsTo(models.Employee, { 
        foreignKey: 'employee_id',
        as: 'employee'
    });
    PerformanceReview.belongsTo(models.Employee, { 
        foreignKey: 'reviewer_id',
        as: 'reviewer'
    });
};

export default PerformanceReview;