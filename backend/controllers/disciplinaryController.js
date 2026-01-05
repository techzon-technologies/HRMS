import { DisciplinaryAction, Employee } from '../models/index.js';

export const getAllDisciplinaryActions = async (req, res) => {
  try {
    const disciplinaryActions = await DisciplinaryAction.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }, {
        model: Employee,
        as: 'issuer',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(disciplinaryActions);
  } catch (error) {
    console.error('Error fetching disciplinary actions:', error);
    res.status(500).json({ message: 'Error fetching disciplinary actions', error: error.message });
  }
};

export const getDisciplinaryActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplinaryAction = await DisciplinaryAction.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }, {
        model: Employee,
        as: 'issuer',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!disciplinaryAction) {
      return res.status(404).json({ message: 'Disciplinary action not found' });
    }

    res.json(disciplinaryAction);
  } catch (error) {
    console.error('Error fetching disciplinary action:', error);
    res.status(500).json({ message: 'Error fetching disciplinary action', error: error.message });
  }
};

export const createDisciplinaryAction = async (req, res) => {
  try {
    const disciplinaryData = req.body;
    const newDisciplinaryAction = await DisciplinaryAction.create(disciplinaryData);
    res.status(201).json(newDisciplinaryAction);
  } catch (error) {
    console.error('Error creating disciplinary action:', error);
    res.status(500).json({ message: 'Error creating disciplinary action', error: error.message });
  }
};

export const updateDisciplinaryAction = async (req, res) => {
  try {
    const { id } = req.params;
    const disciplinaryData = req.body;

    const [updatedRowsCount] = await DisciplinaryAction.update(disciplinaryData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Disciplinary action not found' });
    }

    const updatedDisciplinaryAction = await DisciplinaryAction.findByPk(id);
    res.json(updatedDisciplinaryAction);
  } catch (error) {
    console.error('Error updating disciplinary action:', error);
    res.status(500).json({ message: 'Error updating disciplinary action', error: error.message });
  }
};

export const deleteDisciplinaryAction = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await DisciplinaryAction.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Disciplinary action not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting disciplinary action:', error);
    res.status(500).json({ message: 'Error deleting disciplinary action', error: error.message });
  }
};

export const updateDisciplinaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedDisciplinaryAction = await DisciplinaryAction.update(
      { status: status },
      { where: { id: id } }
    );

    if (updatedDisciplinaryAction[0] === 0) {
      return res.status(404).json({ message: 'Disciplinary action not found' });
    }

    res.json({ message: 'Disciplinary action status updated successfully' });
  } catch (error) {
    console.error('Error updating disciplinary action status:', error);
    res.status(500).json({ message: 'Error updating disciplinary action status', error: error.message });
  }
};