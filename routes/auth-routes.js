let bcrypt = require('bcryptjs');
let crypto = require('crypto');
let db = require('../database');
let helpers = require('../helpers');

function makeToken() {
    return crypto.randomBytes(32).toString('hex');
}

function isValidStudentId(value) {
    if (value.length !== 8) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        let charCode = value.charCodeAt(i);
        if (charCode < 48 || charCode > 57) {
            return false;
        }
    }
    return true;
}

module.exports = function (app, upload, tokenStorage, cookieOptions) {
    async function handleGetCurrentUser(req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            let response = await helpers.buildUserResponse(user);
            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load user' });
        }
    }

    app.get('/api/auth/me', handleGetCurrentUser);
    app.get('/api/user', handleGetCurrentUser);

    app.post('/api/auth/signup', async function (req, res) {
        try {
            let name = req.body.name;
            let email = req.body.email;
            let password = req.body.password;
            let major = req.body.major;
            let studentId = req.body.studentId;

            if (!name || !email || !password || !major || !studentId) {
                return res.status(400).json({ error: 'Name, student ID, email, password, and major are all required' });
            }

            if (!isValidStudentId(studentId)) {
                return res.status(400).json({ error: 'Student ID must be exactly 8 digits' });
            }

            if (!email.endsWith('@drexel.edu')) {
                return res.status(400).json({ error: 'Email must be a @drexel.edu address' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            let existingUser = await db.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'An account with that email already exists' });
            }

            let passwordHash = await bcrypt.hash(password, 10);

            let newUser = await db.createUser({
                name: name,
                email: email,
                passwordHash: passwordHash,
                major: major,
                studentId: studentId,
                classYear: req.body.classYear || 'Freshman',
                avatarUrl: '/assets/default-avatar.png',
                bio: '',
                coop: ''
            });

            let token = makeToken();
            tokenStorage[token] = newUser.id;

            let response = await helpers.buildUserResponse(newUser);
            res.cookie('token', token, cookieOptions).json({ success: true, user: response });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to create account' });
        }
    });

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

            let match = await bcrypt.compare(password || '', user.passwordHash);
            if (!match) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            let token = makeToken();
            tokenStorage[token] = user.id;

            let response = await helpers.buildUserResponse(user);
            res.cookie('token', token, cookieOptions).json({ success: true, user: response });
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
                let token = makeToken();
                tokenStorage[token] = user.id;
                let response = await helpers.buildUserResponse(user);
                return res.cookie('token', token, cookieOptions).json({ success: true, user: response });
            }
            res.status(404).json({ error: 'User not found' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to switch user' });
        }
    });

    app.post('/api/auth/logout', function (req, res) {
        let token = req.cookies.token;
        if (token !== undefined && tokenStorage.hasOwnProperty(token)) {
            delete tokenStorage[token];
        }
        res.clearCookie('token', cookieOptions).json({ success: true });
    });

    app.put('/api/users/profile', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to update your profile', requiresAuth: true });
            }

            let fields = {
                name: req.body.name || user.name,
                major: req.body.major || user.major,
                classYear: req.body.classYear || req.body.gradYear || user.classYear,
                bio: req.body.bio !== undefined ? req.body.bio : user.bio,
                coop: req.body.coop !== undefined ? req.body.coop : user.coop,
                avatarUrl: req.body.avatarUrl || user.avatarUrl
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
