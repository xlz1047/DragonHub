require('dotenv').config();

let express = require('express');
let cookieParser = require('cookie-parser');
let multer = require('multer');
let path = require('path');
let fs = require('fs');

let app = express();
let PORT = process.env.PORT || 3000;

let tokenStorage = {};

let cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
};

let UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        let uniqueName = Date.now() + '-' + Math.round(Math.random() * 1000000);
        let ext = path.extname(file.originalname) || '.jpg';
        cb(null, 'drexel-' + uniqueName + ext);
    }
});

let upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

require('./routes/auth-routes')(app, upload, tokenStorage, cookieOptions);
require('./routes/posts-routes')(app, tokenStorage);
require('./routes/eats-routes')(app, tokenStorage);
require('./routes/marketplace-routes')(app, tokenStorage);
require('./routes/landmarks-routes')(app, tokenStorage);
require('./routes/polls-routes')(app, tokenStorage);
require('./routes/achievements-routes')(app);
require('./routes/notifications-routes')(app, tokenStorage);
require('./routes/weather-routes')(app);
require('./routes/yelp-routes')(app);
require('./routes/geoapify-routes')(app);

app.listen(PORT, function () {
    console.log('DrexelHub server running on http://localhost:' + PORT);
});
