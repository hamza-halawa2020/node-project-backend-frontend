const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('../models/user');
//const user = require('../models/user');



// saving user object in the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error(err);
        done(err);
    }
});


//sign up
passport.use('local.signup', new passportLocal({
    usernameField: 'email',
    fNameField:'fname',
    lengthNameField:'lname',
    ageField:'age',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    if (req.body.password != req.body.confirm_password) {
        return done(null, false, req.flash('error', 'Passwords do not match'));
    } else {
        try {
            const existingUser = await User.findOne({ email: username });
            if (existingUser) {
                return done(null, false, req.flash('error', 'Email already used'));
            }

            const newUser = new User({
                email: req.body.email,
                fName: req.body.fName,
                lName: req.body.lName,
                age: req.body.age
                

                
            });

            newUser.password = newUser.hashPassword(req.body.password);

            await newUser.save();
            return done(null, newUser, req.flash('success', 'User Added'));
        } catch (err) {
            console.log(err);
            return done(err);
        }
    }
}));

//login
passport.use('local.login', new passportLocal({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const user = await User.findOne({ email: username });
        if (!user) {
            return done(null, false, req.flash('error', 'User not found'));
        }
        
        const passwordMatch = user.comparePasswords(password, user.password);
        if (!passwordMatch) {
            return done(null, false, req.flash('error', 'Incorrect password'));
        }
        
        return done(null, user, req.flash('success', 'Welcome back'));
    } catch (err) {
        console.log(err);
        return done(err);
    }
}));

