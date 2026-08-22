let bcrypt = require('bcryptjs');
let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, upload) {
    async function handleGetCurrentUser(req, res) {
        try {
            let user = await helpers.getCurrentUser(req);
            let response = await helpers.buildUserResponse(user);
            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load user' });
        }
    }

    app.get('/api/auth/me', handleGetCurrentUser);
    app.get('/api/user', handleGetCurrentUser);

    app.post('/api/auth/login', async function (req, res) {
        try {
            let email = req.body.email;
            let password = req.body.password;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            let user = await db.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid Drexel credentials' });
            }

            let match = bcrypt.compareSync(password || '', user.passwordHash);
            if (!match) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            req.session.userId = user.id;
            let response = await helpers.buildUserResponse(user);
            res.json({ success: true, user: response });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    app.post('/api/auth/switch', async function (req, res) {
        try {
            let userId = req.body.userId;
            let user = await db.getUserById(userId);
            if (user) {
                req.session.userId = user.id;
                let response = await helpers.buildUserResponse(user);
                return res.json({ success: true, user: response });
            }
            res.status(404).json({ error: 'User not found' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to switch user' });
        }
    });

    app.post('/api/auth/logout', function (req, res) {
        req.session.destroy(function () {
            res.json({ success: true });
        });
    });

    app.put('/api/users/profile', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req);
            let fields = {
                name: req.body.name || user.name,
                major: req.body.major || user.major,
                classYear: req.body.classYear || req.body.gradYear || user.classYear,
                bio: req.body.bio !== undefined ? req.body.bio : user.bio,
                coop: req.body.coop !== undefined ? req.body.coop : user.coop
            };
            let updated = await db.updateUserProfile(user.id, fields);
            let response = await helpers.buildUserResponse(updated);
            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to update profile' });
        }
    });

    app.post('/api/upload', upload.single('image'), function (req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        let imageUrl = '/uploads/' + req.file.filename;
        res.json({ imageUrl: imageUrl });
    });
};
