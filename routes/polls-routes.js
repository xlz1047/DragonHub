let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/polls', async function (req, res) {
        try {
            let polls = await db.getPolls();
            res.json(polls);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load polls' });
        }
    });

    app.post('/api/polls', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
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
            let poll = await db.votePoll(req.params.id, req.body.optionId);

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
};
