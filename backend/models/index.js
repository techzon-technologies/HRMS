import sequelize from '../config/database.js';
import User from './User.js';
import Employee from './Employee.js';
import Expense from './Expense.js';
import Asset from './Asset.js';
import Benefit from './Benefit.js';
import Payroll from './Payroll.js';
import DisciplinaryAction from './DisciplinaryAction.js';
import HealthInsurance from './HealthInsurance.js';
import ComplianceAudit from './ComplianceAudit.js';
import PerformanceReview from './PerformanceReview.js';
import Attendance from './Attendance.js';
import Document from './Document.js';
import Vehicle from './Vehicle.js';
import Department from './Department.js';
import Leave from './Leave.js';
import Visa from './Visa.js';
import DrivingLicence from './DrivingLicence.js';
import CompanySetting from './CompanySetting.js';

// 1. Initialize DB object with models
const db = {
    sequelize,
    User,
    Employee,
    Expense,
    Asset,
    Benefit,
    Payroll,
    DisciplinaryAction,
    HealthInsurance,
    ComplianceAudit,
    PerformanceReview,
    Attendance,
    Document,
    Vehicle,
    Department,
    Leave,
    Visa,
    DrivingLicence,
    CompanySetting
};

// 2. Register Associations
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'departmentData' });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

export {
    User,
    Employee,
    Expense,
    Asset,
    Benefit,
    Payroll,
    DisciplinaryAction,
    HealthInsurance,
    ComplianceAudit,
    PerformanceReview,
    Attendance,
    Document,
    Vehicle,
    Department,
    Leave,
    Visa,
    DrivingLicence,
    CompanySetting
};
export default db;
