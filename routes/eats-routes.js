let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/eats', async function (req, res) {
        try {
            let trucks = await db.getFoodTrucks(req.query.cuisine);
            res.json(trucks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load food trucks' });
        }
    });

    app.post('/api/eats/:id/checkin', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            await db.addUserPoints(user.id, 25);
            res.json({ success: true, points: 25 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to check in' });
        }
    });
};
