const PORT = 80;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session')
const config = require("./config");
const markdown = require('markdown-it')({html: true})
                    .use(require('markdown-it-attrs'));
const multer = require('multer');
const logger = require('./logger');

  
  //if (process.env.NODE_ENV === 'production') {
  //}

// Middleware for file upload
const forms = multer({limits: { fieldSize: 25 * 1024 * 1024 }});

app.locals.markdown = (filename) => { 
    const path = process.cwd() + filename;
    const data = require('fs').readFileSync(path, 'utf8').toString();
    return markdown.render(data);
}
                    
// Configure the EJS template engine
// Add support for markdown file rendering
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

//app.use(bodyParser.json({limit:'50mb'}));
app.use(forms.array()); 
app.use('/static', express.static('public'));
//app.use(fileUpload());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const ONE_HOUR = 3600000;
const sess= {
    secret: 'AIFEX super secret',
    resave: false,
    saveUninitialized: true,
    maxAge: ONE_HOUR,
    cookie: {}
};

if (app.get('env') === 'production') {
    app.set('trust proxy', true); // trust first proxy
    if (process.env.PROTOCOL === 'https') {
        sess.cookie.secure = true; // serve secure cookies
    } else {
        sess.cookie.secure = false; // serve secure cookies
    }
}

app.use(session(sess));

require("./routes/account.js")(app, config);
require("./routes/statics.js")(app, config);
require("./routes/session.js")(app, config);
require("./routes/sessionInvitation.js")(app, config);
require("./routes/website.js")(app, config);
require("./routes/evaluation.js")(app, config);


app.listen(PORT, function () {
    logger.info(`Server is running on port ${PORT}!`)
})
