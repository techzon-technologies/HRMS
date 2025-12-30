import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComplianceAudit = sequelize.define('ComplianceAudit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_audit_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    next_audit_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    findings_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('compliant', 'needs_improvement', 'pending_review', 'non_compliant'),
        defaultValue: 'pending_review'
    },
    auditor_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    report_url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'ComplianceAudits',
    timestamps: true
});

export default ComplianceAudit;