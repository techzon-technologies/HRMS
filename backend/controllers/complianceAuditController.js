import { ComplianceAudit, Employee } from '../models/index.js';

export const getAllComplianceAudits = async (req, res) => {
  try {
    const complianceAudits = await ComplianceAudit.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(complianceAudits);
  } catch (error) {
    console.error('Error fetching compliance audits:', error);
    res.status(500).json({ message: 'Error fetching compliance audits', error: error.message });
  }
};

export const getComplianceAuditById = async (req, res) => {
  try {
    const { id } = req.params;
    const complianceAudit = await ComplianceAudit.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!complianceAudit) {
      return res.status(404).json({ message: 'Compliance audit not found' });
    }

    res.json(complianceAudit);
  } catch (error) {
    console.error('Error fetching compliance audit:', error);
    res.status(500).json({ message: 'Error fetching compliance audit', error: error.message });
  }
};

export const createComplianceAudit = async (req, res) => {
  try {
    const complianceAuditData = req.body;
    const newComplianceAudit = await ComplianceAudit.create(complianceAuditData);
    res.status(201).json(newComplianceAudit);
  } catch (error) {
    console.error('Error creating compliance audit:', error);
    res.status(500).json({ message: 'Error creating compliance audit', error: error.message });
  }
};

export const updateComplianceAudit = async (req, res) => {
  try {
    const { id } = req.params;
    const complianceAuditData = req.body;
    
    const [updatedRowsCount] = await ComplianceAudit.update(complianceAuditData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Compliance audit not found' });
    }

    const updatedComplianceAudit = await ComplianceAudit.findByPk(id);
    res.json(updatedComplianceAudit);
  } catch (error) {
    console.error('Error updating compliance audit:', error);
    res.status(500).json({ message: 'Error updating compliance audit', error: error.message });
  }
};

export const deleteComplianceAudit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await ComplianceAudit.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Compliance audit not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting compliance audit:', error);
    res.status(500).json({ message: 'Error deleting compliance audit', error: error.message });
  }
};

export const updateComplianceAuditStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedComplianceAudit = await ComplianceAudit.update(
      { status: status },
      { where: { id: id } }
    );

    if (updatedComplianceAudit[0] === 0) {
      return res.status(404).json({ message: 'Compliance audit not found' });
    }

    res.json({ message: 'Compliance audit status updated successfully' });
  } catch (error) {
    console.error('Error updating compliance audit status:', error);
    res.status(500).json({ message: 'Error updating compliance audit status', error: error.message });
  }
};