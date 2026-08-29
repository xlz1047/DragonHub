let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/polls', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            let userId = user ? user.id : null;
            let polls = await db.getPolls(userId);
            res.json(polls);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load polls' });
        }
    });

    app.post('/api/polls', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to create a poll', requiresAuth: true });
            }

            let question = req.body.question;
            let options = req.body.options;

            if (!question || !options || options.length < 2) {
                return res.status(400).json({ error: 'Question and at least 2 options are required' });
            }

            let cleanOptions = [];
            for (let i = 0; i < options.length; i++) {
                if (options[i] && options[i].trim()) {
                    cleanOptions.push(options[i].trim());
                }
            }

            let newPoll = await db.createPoll({
                creatorId: user.id,
                authorName: user.name,
                question: question,
                category: req.body.category || 'Campus Life',
                options: cleanOptions
            });

            await db.addUserPoints(user.id, 20);
            res.json(newPoll);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to create poll' });
        }
    });

    app.post('/api/polls/:id/vote', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to vote', requiresAuth: true });
            }

            let poll = await db.votePoll(req.params.id, req.body.optionId, user.id);

            if (poll === 'ALREADY_VOTED') {
                return res.status(400).json({ error: 'You already voted on this poll' });
            }

            if (!poll) {
                return res.status(404).json({ error: 'Poll not found' });
            }

            await db.addUserPoints(user.id, 10);
            res.json(poll);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to record vote' });
        }
    });

    app.delete('/api/polls/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let deleted = await db.deletePoll(req.params.id, user.id);
            if (!deleted) {
                return res.status(403).json({ error: 'You can only delete your own polls' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete poll' });
        }
    });
};
