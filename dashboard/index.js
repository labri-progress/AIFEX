const PORT = 80;
const express = require('express');
const session = require('express-session')
const config = require("./config");
const markdown = require('markdown-it')({html: true})
                    .use(require('markdown-it-attrs'));
const multer = require('multer');
const logger = require('./logger');

const ONE_HOUR = 3600000;


const app = express();
app.set('view engine', 'ejs');


app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

console.log("Start")
const sessionMiddleware = session({
    secret: 'AIFEX super secret',
    cookie: {
        secure: process.env.PROTOCOL === 'https',
        httpOnly: false,
        maxAge: ONE_HOUR,
        path: "/"
    },
    proxy: (process.env.NODE_ENV === 'production'),
    saveUninitialized: true
});

app.use(sessionMiddleware);

// Middleware for file upload
const forms = multer({limits: { fieldSize: 25 * 1024 * 1024 }});

app.locals.markdown = (filename) => { 
    const path = process.cwd() + filename;
    const data = require('fs').readFileSync(path, 'utf8').toString();
    return markdown.render(data);
}

                    
// Configure the EJS template engine
// Add support for markdown file rendering

app.use(forms.array()); 
app.use('/static', express.static('public'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });
require("./routes/account.js")(app, config);
require("./routes/statics.js")(app, config);
require("./routes/session.js")(app, config);
require("./routes/sessionInvitation.js")(app, config);

require("./routes/website.js")(app, config);
require("./routes/evaluation.js")(app, config);


app.listen(PORT, function () {
    logger.info(`Server is running on port ${PORT}!`)
})
