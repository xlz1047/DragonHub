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

    app.get('/api/eats/:id/reviews', async function (req, res) {
        try {
            let reviews = await db.getTruckReviews(req.params.id);
            res.json(reviews);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load reviews' });
        }
    });

    app.post('/api/eats/:id/reviews', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to leave a review', requiresAuth: true });
            }

            let rating = Number(req.body.rating);
            let comment = req.body.comment || '';

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            let newReview = await db.addTruckReview(req.params.id, user.id, user.name, rating, comment.trim());
            await db.addUserPoints(user.id, 5);
            res.json(newReview);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to submit review' });
        }
    });

    app.delete('/api/eats/reviews/:reviewId', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let deleted = await db.deleteTruckReview(req.params.reviewId, user.id);
            if (!deleted) {
                return res.status(403).json({ error: 'You can only delete your own review' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete review' });
        }
    });
};
