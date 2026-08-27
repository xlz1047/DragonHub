let db = require('../database');
let helpers = require('../helpers');
let axios = require('axios')

module.exports = function (app) {
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
            let user = await helpers.getCurrentUser(req);
            await db.addUserPoints(user.id, 25);
            res.json({ success: true, points: 25 });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Unable to check in' });
        }

    });

    app.get('/api/yelp', async function(req, res) {
        try{
            let name = req.query.name;
            let location = req.query.location || 'Philadelphia, PA';
            let businessId = req.query.id;
            let url = businessId 
            ? `https://api.yelp.com/v3/businesses/${businessId}`
            : 'https://api.yelp.com/v3/businesses/search';
        let response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${process.env.YELP_API_KEY}`
        },
            params: businessId ? {} : {
            term: name,
            location: location,
            limit: 1
            }    
    });
    let business = businessId ? response.data : response.data.businesses[0];
    res.json({
        rating: business.rating,
        review_count: business.review_count,
        url: business.url,
        image_url: business.image_url
    });
    }  catch(error){
        console.error(error);
        res.status(500).json({error: 'Unable to fetch data'});
    }
});
}       
