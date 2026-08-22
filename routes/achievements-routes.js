let db = require('../database');

module.exports = function (app) {
    app.get('/api/achievements', async function (req, res) {
        try {
            let achievements = await db.getAchievements();
            res.json(achievements);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load achievements' });
        }
    });
};
