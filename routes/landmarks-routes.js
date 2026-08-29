let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
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
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to check in', requiresAuth: true });
            }
            await db.addUserPoints(user.id, 25);
            res.json({ success: true, points: 25 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to check in' });
        }
    });

    app.post('/api/landmarks', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to add a pin', requiresAuth: true });
            }

            let name = req.body.name;
            let description = req.body.description;
            let lat = req.body.lat;
            let lng = req.body.lng;
            let imageUrl = req.body.imageUrl;

            if (!name || lat === undefined || lng === undefined) {
                return res.status(400).json({ error: 'Name and coordinates are required' });
            }

            let newLandmark = await db.addLandmark(name, description || '', lat, lng, imageUrl);
            res.json(newLandmark);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to save pin' });
        }
    });

    app.delete('/api/landmarks/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to delete a pin', requiresAuth: true });
            }
            await db.deleteLandmark(req.params.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete pin' });
        }
    });
};
