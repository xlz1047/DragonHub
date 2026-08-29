let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app, tokenStorage) {
    app.get('/api/marketplace', async function (req, res) {
        try {
            let items = await db.getMarketplaceItems(req.query.category);
            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to load marketplace' });
        }
    });

    app.post('/api/marketplace', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required to post a listing', requiresAuth: true });
            }

            let title = req.body.title;
            let price = req.body.price;

            if (!title || !price) {
                return res.status(400).json({ error: 'Title and price are required' });
            }

            let newItem = await db.createMarketplaceItem({
                sellerId: user.id,
                sellerName: user.name,
                sellerEmail: user.email,
                title: title,
                price: Number(price),
                category: req.body.category || 'Other',
                condition: req.body.condition || 'Good',
                location: req.body.location || 'Hagerty Library',
                description: req.body.description || '',
                imageUrl: req.body.imageUrl || '/assets/book.png'
            });

            await db.addUserPoints(user.id, 20);
            res.json(newItem);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to create listing' });
        }
    });

    app.post('/api/marketplace/:id/save', function (req, res) {
        res.json({ isSaved: true });
    });

    app.put('/api/marketplace/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let updated = await db.updateMarketplaceItem(req.params.id, user.id, {
                price: req.body.price,
                description: req.body.description,
                isSold: req.body.isSold
            });

            if (!updated) {
                return res.status(403).json({ error: 'You can only edit your own listings' });
            }
            res.json(updated);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to update listing' });
        }
    });

    app.delete('/api/marketplace/:id', async function (req, res) {
        try {
            let user = await helpers.getCurrentUser(req, tokenStorage);
            if (!user) {
                return res.status(401).json({ error: 'Sign in required', requiresAuth: true });
            }

            let deleted = await db.deleteMarketplaceItem(req.params.id, user.id);
            if (!deleted) {
                return res.status(403).json({ error: 'You can only delete your own listings' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to delete listing' });
        }
    });
};
