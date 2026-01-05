import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null initially, or enforced if logic ensures it
        field: 'department_id', // Maps to department_id column in database
        references: {
            model: 'Departments',
            key: 'id'
        }
    },
    // Keeping department string for backward compatibility or view purposes if needed, 
    // but ultimately we want to rely on the relation.
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hireDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'terminated'),
        defaultValue: 'active'
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
});

export default Employee;
