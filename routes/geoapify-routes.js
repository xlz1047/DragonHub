let axios = require('axios');

module.exports = function (app) {
    app.get('/api/geocode', function (req, res) {
        let geocodeUrl = 'https://api.geoapify.com/v1/geocode/search';

        axios.get(geocodeUrl, {
            params: {
                text: req.query.address,
                filter: 'circle:-75.1899,39.9566,3000',
                apiKey: process.env.GEOAPIFY_API_KEY
            }
        }).then(function (response) {
            let features = response.data.features;

            if (!features || features.length === 0) {
                return res.status(404).json({ error: 'Address not found' });
            }

            let place = features[0].properties;
            res.json({
                formattedAddress: place.formatted,
                lat: place.lat,
                lng: place.lon
            });
        }).catch(function (error) {
            console.error(error);
            res.status(500).json({ error: 'Geocoding is unavailable right now' });
        });
    });

    app.get('/api/reverse-geocode', function (req, res) {
        let reverseUrl = 'https://api.geoapify.com/v1/geocode/reverse';

        axios.get(reverseUrl, {
            params: {
                lat: req.query.lat,
                lon: req.query.lng,
                apiKey: process.env.GEOAPIFY_API_KEY
            }
        }).then(function (response) {
            let features = response.data.features;

            if (!features || features.length === 0) {
                return res.status(404).json({ error: 'Location not found' });
            }

            let place = features[0].properties;
            res.json({
                formattedAddress: place.formatted,
                street: place.street,
                building: place.building
            });
        }).catch(function (error) {
            console.error(error);
            res.status(500).json({ error: 'Reverse geocoding is unavailable right now' });
        });
    });
};
