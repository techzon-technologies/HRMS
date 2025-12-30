import { Asset } from '../models/index.js';

export const getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.findAll({
            include: ['employee'] // Include employee details if assigned
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assets', error: error.message });
    }
};

export const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findByPk(req.params.id, {
            include: ['employee']
        });
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(asset);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching asset', error: error.message });
    }
};

export const createAsset = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: 'Error creating asset', error: error.message });
    }
};

export const updateAsset = async (req, res) => {
    try {
        const [updated] = await Asset.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedAsset = await Asset.findByPk(req.params.id, {
                include: ['employee']
            });
            return res.json(updatedAsset);
        }
        throw new Error('Asset not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating asset', error: error.message });
    }
};

export const deleteAsset = async (req, res) => {
    try {
        const deleted = await Asset.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Asset deleted successfully' });
        }
        throw new Error('Asset not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting asset', error: error.message });
    }
};

export const assignAsset = async (req, res) => {
    try {
        const { assigned_to } = req.body;
        const [updated] = await Asset.update(
            { 
                assigned_to,
                status: assigned_to ? 'assigned' : 'available'
            },
            { where: { id: req.params.id } }
        );
        if (updated) {
            const asset = await Asset.findByPk(req.params.id, {
                include: ['employee']
            });
            return res.json(asset);
        }
        throw new Error('Asset not found');
    } catch (error) {
        res.status(400).json({ message: 'Error assigning asset', error: error.message });
    }
};