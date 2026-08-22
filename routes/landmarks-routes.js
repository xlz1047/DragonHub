let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app) {
    app.get('/api/landmarks', async function (req, res) {
        try {
            let landmarks = await db.getLandmarks();
            res.json(landmarks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load landmarks' });
        }
    });

    app.post('/api/landmarks/:id/checkin', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req);
            await db.addUserPoints(user.id, 25);
            res.json({ success: true, points: 25 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to check in' });
        }
    });
};
