let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/notifications', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.json([]);
            }
            let notifications = await db.getNotifications(user.id);
            res.json(notifications);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load notifications' });
        }
    });

    app.post('/api/notifications/read', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }
            await db.markNotificationsRead(user.id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to update notifications' });
        }
    });
};
