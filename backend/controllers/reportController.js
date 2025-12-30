import { Expense, Asset, Benefit, Payroll, DisciplinaryAction, HealthInsurance, ComplianceAudit, PerformanceReview, Employee } from '../models/index.js';
import { Op } from 'sequelize';

export const generateExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    
    res.json({
      totalExpenses: expenses.length,
      totalAmount: totalAmount,
      expenses: expenses
    });
  } catch (error) {
    console.error('Error generating expense report:', error);
    res.status(500).json({ message: 'Error generating expense report', error: error.message });
  }
};

export const generateAssetReport = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      include: [{
        model: Employee,
        as: 'assignedTo',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const assignedAssets = assets.filter(asset => asset.assignedTo).length;
    const unassignedAssets = assets.length - assignedAssets;
    
    res.json({
      totalAssets: assets.length,
      assignedAssets: assignedAssets,
      unassignedAssets: unassignedAssets,
      assets: assets
    });
  } catch (error) {
    console.error('Error generating asset report:', error);
    res.status(500).json({ message: 'Error generating asset report', error: error.message });
  }
};

export const generateBenefitReport = async (req, res) => {
  try {
    const benefits = await Benefit.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const totalBenefits = benefits.length;
    const totalAmount = benefits.reduce((sum, benefit) => sum + parseFloat(benefit.amount || 0), 0);
    
    res.json({
      totalBenefits: totalBenefits,
      totalAmount: totalAmount,
      benefits: benefits
    });
  } catch (error) {
    console.error('Error generating benefit report:', error);
    res.status(500).json({ message: 'Error generating benefit report', error: error.message });
  }
};

export const generatePayrollReport = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const processedPayrolls = payrolls.filter(payroll => payroll.status === 'processed').length;
    const pendingPayrolls = payrolls.length - processedPayrolls;
    const totalAmount = payrolls.reduce((sum, payroll) => sum + parseFloat(payroll.netPay || 0), 0);
    
    res.json({
      totalPayrolls: payrolls.length,
      processedPayrolls: processedPayrolls,
      pendingPayrolls: pendingPayrolls,
      totalAmount: totalAmount,
      payrolls: payrolls
    });
  } catch (error) {
    console.error('Error generating payroll report:', error);
    res.status(500).json({ message: 'Error generating payroll report', error: error.message });
  }
};

export const generateDisciplinaryReport = async (req, res) => {
  try {
    const disciplinaryActions = await DisciplinaryAction.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const activeDisciplinaryActions = disciplinaryActions.filter(action => action.status === 'active').length;
    const resolvedDisciplinaryActions = disciplinaryActions.length - activeDisciplinaryActions;
    
    res.json({
      totalDisciplinaryActions: disciplinaryActions.length,
      activeDisciplinaryActions: activeDisciplinaryActions,
      resolvedDisciplinaryActions: resolvedDisciplinaryActions,
      disciplinaryActions: disciplinaryActions
    });
  } catch (error) {
    console.error('Error generating disciplinary report:', error);
    res.status(500).json({ message: 'Error generating disciplinary report', error: error.message });
  }
};

export const generateHealthInsuranceReport = async (req, res) => {
  try {
    const healthInsurances = await HealthInsurance.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const activeInsurances = healthInsurances.filter(insurance => insurance.status === 'active').length;
    const expiredInsurances = healthInsurances.length - activeInsurances;
    
    res.json({
      totalInsurances: healthInsurances.length,
      activeInsurances: activeInsurances,
      expiredInsurances: expiredInsurances,
      healthInsurances: healthInsurances
    });
  } catch (error) {
    console.error('Error generating health insurance report:', error);
    res.status(500).json({ message: 'Error generating health insurance report', error: error.message });
  }
};

export const generateComplianceReport = async (req, res) => {
  try {
    const complianceAudits = await ComplianceAudit.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const compliantAudits = complianceAudits.filter(audit => audit.status === 'compliant').length;
    const nonCompliantAudits = complianceAudits.length - compliantAudits;
    
    res.json({
      totalAudits: complianceAudits.length,
      compliantAudits: compliantAudits,
      nonCompliantAudits: nonCompliantAudits,
      complianceAudits: complianceAudits
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ message: 'Error generating compliance report', error: error.message });
  }
};

export const generatePerformanceReport = async (req, res) => {
  try {
    const performanceReviews = await PerformanceReview.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    
    const averageRating = performanceReviews.length > 0 
      ? performanceReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / performanceReviews.length 
      : 0;
    
    res.json({
      totalReviews: performanceReviews.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      performanceReviews: performanceReviews
    });
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ message: 'Error generating performance report', error: error.message });
  }
};

export const generateOverallReport = async (req, res) => {
  try {
    // Get counts for all entities
    const expenseCount = await Expense.count();
    const assetCount = await Asset.count();
    const benefitCount = await Benefit.count();
    const payrollCount = await Payroll.count();
    const disciplinaryCount = await DisciplinaryAction.count();
    const healthInsuranceCount = await HealthInsurance.count();
    const complianceCount = await ComplianceAudit.count();
    const performanceCount = await PerformanceReview.count();
    const employeeCount = await Employee.count();
    
    res.json({
      totalEmployees: employeeCount,
      totalExpenses: expenseCount,
      totalAssets: assetCount,
      totalBenefits: benefitCount,
      totalPayrolls: payrollCount,
      totalDisciplinaryActions: disciplinaryCount,
      totalHealthInsurances: healthInsuranceCount,
      totalComplianceAudits: complianceCount,
      totalPerformanceReviews: performanceCount
    });
  } catch (error) {
    console.error('Error generating overall report:', error);
    res.status(500).json({ message: 'Error generating overall report', error: error.message });
  }
};
