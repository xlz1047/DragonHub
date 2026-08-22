let axios = require('axios');

module.exports = function (app) {
    app.get('/api/weather', function (req, res) {
        let weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

        axios.get(weatherUrl, {
            params: {
                lat: 39.9566,
                lon: -75.1899,
                units: 'imperial',
                appid: process.env.WEATHER_API_KEY
            }
        }).then(function (response) {
            let data = response.data;
            res.json({
                temp: Math.round(data.main.temp) + 'F',
                condition: data.weather[0].main,
                city: 'Philadelphia, PA'
            });
        }).catch(function (error) {
            console.error(error);
            res.status(500).json({ error: 'Weather is unavailable right now' });
        });
    });
};
