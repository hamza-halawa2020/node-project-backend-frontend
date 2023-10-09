const express = require('express');
const db = require('./config/db');
const bodyParser = require('body-parser') //(bodyparser package) to get data from form 
const session = require('express-session') // to save the data in cokkies
const flash = require('connect-flash')
const passport = require('passport');
const passportSetup = require('./config/passport-setup.js');
const app = express();






app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static('node_modules'));

//configuration to session and flash
app.use(session({
    secret: 'hamza halawa',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 15 }
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req,res,next) => {
    res.locals.user = req.user || null
    next()
})

app.get('/favicon.ico', (req, res) => res.status(204));//كان فى خطأ بيظهر لما المستخدم يظغط على اى شيء فى الموقع ولكن هذا الكود اوقفه


const users = require('./routes/user-routes.js')
app.use('/', users)

const events = require('./routes/event-routes.js')
app.use('/', events)













const port = 5000;
app.listen(port, () => {
    try {
        console.log(`app is working in port ${port}`);
    } catch (err) {
        console.log(`failed to connect to server =====>>>>>  ${err}`);
    }
})
