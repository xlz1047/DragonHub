let axios = require('axios');

module.exports = function (app) {
    app.get('/api/yelp', function (req, res) {
        let searchUrl = 'https://api.yelp.com/v3/businesses/search';

        axios.get(searchUrl, {
            headers: {
                Authorization: 'Bearer ' + process.env.YELP_API_KEY
            },
            params: {
                term: req.query.name || 'food truck',
                location: req.query.location || 'Drexel University, Philadelphia, PA',
                limit: 1
            }
        }).then(function (response) {
            let businesses = response.data.businesses;

            if (!businesses || businesses.length === 0) {
                return res.status(404).json({ error: 'No matching business found' });
            }

            let business = businesses[0];
            res.json({
                name: business.name,
                rating: business.rating,
                review_count: business.review_count,
                image_url: business.image_url,
                url: business.url
            });
        }).catch(function (error) {
            console.error(error);
            res.status(500).json({ error: 'Yelp data is unavailable right now' });
        });
    });
};
