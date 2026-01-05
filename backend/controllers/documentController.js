import { Document } from '../models/index.js';

export const getAllDocuments = async (req, res) => {
    try {
        const documents = await Document.findAll({
            include: ['employee']
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id, {
            include: ['employee']
        });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
};

export const createDocument = async (req, res) => {
    try {
        const document = await Document.create(req.body);
        const documentWithEmployee = await Document.findByPk(document.id, {
            include: ['employee']
        });
        res.status(201).json(documentWithEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error creating document', error: error.message });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const [updated] = await Document.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedDocument = await Document.findByPk(req.params.id, {
                include: ['employee']
            });
            return res.json(updatedDocument);
        }
        throw new Error('Document not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating document', error: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const deleted = await Document.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            return res.json({ message: 'Document deleted successfully' });
        }
        throw new Error('Document not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting document', error: error.message });
    }
};
