let db = require('../database');
let helpers = require('../helpers');

module.exports = function (app) {
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
            let user = await helpers.getCurrentUser(req);
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
};
