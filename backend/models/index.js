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

// Define associations
Expense.associate({ Employee });
Asset.associate({ Employee });
Benefit.associate({ Employee });
Payroll.associate({ Employee });
DisciplinaryAction.associate({ Employee });
HealthInsurance.associate({ Employee });
PerformanceReview.associate({ Employee });

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
    PerformanceReview
};

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
    PerformanceReview
};
export default db;
