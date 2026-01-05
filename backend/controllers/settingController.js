import { CompanySetting, User } from '../models/index.js';

export const getCompanySettings = async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (!settings) {
            settings = await CompanySetting.create({
                companyName: 'My Company',
                email: 'admin@company.com',
                timezone: 'est',
                workStart: '09:00',
                workEnd: '17:00'
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching company settings', error: error.message });
    }
};

export const updateCompanySettings = async (req, res) => {
    try {
        let settings = await CompanySetting.findOne();
        if (!settings) {
            settings = await CompanySetting.create(req.body);
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating company settings', error: error.message });
    }
};

export const updateUserSettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Merge existing preferences with new ones
        const currentPreferences = user.preferences || {};
        const newPreferences = {
            ...currentPreferences,
            ...req.body.preferences
        };

        if (req.body.twoFA !== undefined) {
            newPreferences.twoFA = req.body.twoFA;
        }

        await user.update({ preferences: newPreferences });

        res.json({
            message: 'Settings updated successfully',
            preferences: newPreferences
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user settings', error: error.message });
    }
};
