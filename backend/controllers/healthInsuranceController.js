import { HealthInsurance, Employee } from '../models/index.js';

export const getAllHealthInsurances = async (req, res) => {
  try {
    const healthInsurances = await HealthInsurance.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(healthInsurances);
  } catch (error) {
    console.error('Error fetching health insurances:', error);
    res.status(500).json({ message: 'Error fetching health insurances', error: error.message });
  }
};

export const getHealthInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;
    const healthInsurance = await HealthInsurance.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!healthInsurance) {
      return res.status(404).json({ message: 'Health insurance not found' });
    }

    res.json(healthInsurance);
  } catch (error) {
    console.error('Error fetching health insurance:', error);
    res.status(500).json({ message: 'Error fetching health insurance', error: error.message });
  }
};

export const createHealthInsurance = async (req, res) => {
  try {
    const healthInsuranceData = req.body;
    const newHealthInsurance = await HealthInsurance.create(healthInsuranceData);
    res.status(201).json(newHealthInsurance);
  } catch (error) {
    console.error('Error creating health insurance:', error);
    res.status(500).json({ message: 'Error creating health insurance', error: error.message });
  }
};

export const updateHealthInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    const healthInsuranceData = req.body;
    
    const [updatedRowsCount] = await HealthInsurance.update(healthInsuranceData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Health insurance not found' });
    }

    const updatedHealthInsurance = await HealthInsurance.findByPk(id);
    res.json(updatedHealthInsurance);
  } catch (error) {
    console.error('Error updating health insurance:', error);
    res.status(500).json({ message: 'Error updating health insurance', error: error.message });
  }
};

export const deleteHealthInsurance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await HealthInsurance.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Health insurance not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting health insurance:', error);
    res.status(500).json({ message: 'Error deleting health insurance', error: error.message });
  }
};

export const updateHealthInsuranceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedHealthInsurance = await HealthInsurance.update(
      { status: status },
      { where: { id: id } }
    );

    if (updatedHealthInsurance[0] === 0) {
      return res.status(404).json({ message: 'Health insurance not found' });
    }

    res.json({ message: 'Health insurance status updated successfully' });
  } catch (error) {
    console.error('Error updating health insurance status:', error);
    res.status(500).json({ message: 'Error updating health insurance status', error: error.message });
  }
};