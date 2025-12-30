import { PerformanceReview, Employee } from '../models/index.js';

export const getAllPerformanceReviews = async (req, res) => {
  try {
    const performanceReviews = await PerformanceReview.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });
    res.json(performanceReviews);
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.status(500).json({ message: 'Error fetching performance reviews', error: error.message });
  }
};

export const getPerformanceReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const performanceReview = await PerformanceReview.findByPk(id, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    if (!performanceReview) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json(performanceReview);
  } catch (error) {
    console.error('Error fetching performance review:', error);
    res.status(500).json({ message: 'Error fetching performance review', error: error.message });
  }
};

export const createPerformanceReview = async (req, res) => {
  try {
    const performanceReviewData = req.body;
    const newPerformanceReview = await PerformanceReview.create(performanceReviewData);
    res.status(201).json(newPerformanceReview);
  } catch (error) {
    console.error('Error creating performance review:', error);
    res.status(500).json({ message: 'Error creating performance review', error: error.message });
  }
};

export const updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const performanceReviewData = req.body;
    
    const [updatedRowsCount] = await PerformanceReview.update(performanceReviewData, {
      where: { id: id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    const updatedPerformanceReview = await PerformanceReview.findByPk(id);
    res.json(updatedPerformanceReview);
  } catch (error) {
    console.error('Error updating performance review:', error);
    res.status(500).json({ message: 'Error updating performance review', error: error.message });
  }
};

export const deletePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await PerformanceReview.destroy({
      where: { id: id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting performance review:', error);
    res.status(500).json({ message: 'Error deleting performance review', error: error.message });
  }
};

export const updatePerformanceReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedPerformanceReview = await PerformanceReview.update(
      { status: status },
      { where: { id: id } }
    );

    if (updatedPerformanceReview[0] === 0) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    res.json({ message: 'Performance review status updated successfully' });
  } catch (error) {
    console.error('Error updating performance review status:', error);
    res.status(500).json({ message: 'Error updating performance review status', error: error.message });
  }
};