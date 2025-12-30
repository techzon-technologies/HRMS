import { Benefit, Employee } from '../models/index.js';

export const getAllBenefits = async (req, res) => {
  try {
    const benefits = await Benefit.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({ message: 'Error fetching benefits', error: error.message });
  }
};

export const getBenefitById = async (req, res) => {
  try {
    const { id } = req.params;
    const benefit = await Benefit.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!benefit) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    res.json(benefit);
  } catch (error) {
    console.error('Error fetching benefit:', error);
    res.status(500).json({ message: 'Error fetching benefit', error: error.message });
  }
};

export const createBenefit = async (req, res) => {
  try {
    const benefitData = req.body;
    const newBenefit = await Benefit.create(benefitData);
    res.status(201).json(newBenefit);
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(500).json({ message: 'Error creating benefit', error: error.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    const benefitData = req.body;
    
    const [updatedRowsCount] = await Benefit.update(benefitData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    const updatedBenefit = await Benefit.findByPk(id);
    res.json(updatedBenefit);
  } catch (error) {
    console.error('Error updating benefit:', error);
    res.status(500).json({ message: 'Error updating benefit', error: error.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await Benefit.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting benefit:', error);
    res.status(500).json({ message: 'Error deleting benefit', error: error.message });
  }
};