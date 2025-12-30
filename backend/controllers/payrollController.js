import { Payroll, Employee } from '../models/index.js';

export const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ message: 'Error fetching payrolls', error: error.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: 'Error fetching payroll', error: error.message });
  }
};

export const createPayroll = async (req, res) => {
  try {
    const payrollData = req.body;
    const newPayroll = await Payroll.create(payrollData);
    res.status(201).json(newPayroll);
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ message: 'Error creating payroll', error: error.message });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollData = req.body;
    
    const [updatedRowsCount] = await Payroll.update(payrollData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    const updatedPayroll = await Payroll.findByPk(id);
    res.json(updatedPayroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ message: 'Error updating payroll', error: error.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await Payroll.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payroll:', error);
    res.status(500).json({ message: 'Error deleting payroll', error: error.message });
  }
};

export const processPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPayroll = await Payroll.update(
      { status: 'processed' },
      { where: { id: id } }
    );

    if (updatedPayroll[0] === 0) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    res.json({ message: 'Payroll processed successfully' });
  } catch (error) {
    console.error('Error processing payroll:', error);
    res.status(500).json({ message: 'Error processing payroll', error: error.message });
  }
};