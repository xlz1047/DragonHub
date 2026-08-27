require('dotenv').config();

let express = require('express');
let session = require('express-session');
let multer = require('multer');
let path = require('path');
let fs = require('fs');

let app = express();
let PORT = process.env.PORT || 3000;

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

app.use(session({
    secret: process.env.SESSION_SECRET || 'drexel-dragons-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

require('./routes/auth-routes')(app, upload);
require('./routes/posts-routes')(app);
require('./routes/eats-routes')(app);
require('./routes/marketplace-routes')(app);
require('./routes/landmarks-routes')(app);
require('./routes/polls-routes')(app);
require('./routes/achievements-routes')(app);
require('./routes/notifications-routes')(app);
require('./routes/weather-routes')(app);

app.listen(PORT, function () {
    console.log('DrexelHub server running on http://localhost:' + PORT);
});
