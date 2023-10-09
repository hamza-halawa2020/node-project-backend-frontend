const express = require("express")
const router = express.Router()
const user = require('../models/user.js')
const User = require('../models/user.js')
const EVENT = require('../models/event.js')
const passport = require("passport")
const isAuthenticated = require('./middleware.js')
const bcrypt = require('bcrypt-nodejs')

//const { event } = require("jquery")


// login
router.get('/login', (req, res) => {
    res.render('user/login', {
        error: req.flash('error')
    })
})

router.post('/login',
    passport.authenticate('local.login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
)
//signup
router.get('/signup', (req, res) => {
    res.render('user/signup', {
        error: req.flash('error')
    })
})

router.post('/signup',
    passport.authenticate('local.signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    })
)


//profile
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('user/profile', {
        success: req.flash('success')
    })
})

//go to change password page
router.get('/change', isAuthenticated, (req, res) => {
    res.render('user/change', {
        success: req.flash('success')
    })
})


// logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

//delete user
router.delete('/deleteuUsr/:id', async (req, res) => {
    //console.log(req.params.id);
    //res.json("ok")
    let query = { _id: req.params.id }

    try {
        await user.deleteOne(query);
        res.status(200).json('deleted')
    } catch (err) {
        res.status(404).json('error404')
    }
})

//delete user and all tasks for him
router.delete('/terminate/:id', async (req, res) => {
    let userId = req.params.id;

    try {
        await EVENT.deleteMany({ user_id: userId });
    } catch (err) {
        console.error(err);
    }

    try {
        await User.deleteOne({ _id: userId });
        res.status(200).json('User and associated tasks deleted');
    } catch (err) {
        console.error(err);
        res.status(500).json('Error deleting user');
    }

})
//data change 
router.post('/change-data', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const newfName = req.body.newfName;
        const newlName = req.body.newlName;
        const newAge = req.body.newAge;

        if (newfName) {
            user.fName = newfName;
        }

        if (newlName) {
            user.lName = newlName;
        }

        if (newAge) {
            user.age = newAge;
        }

        await user.save();

        req.flash('success', 'Data changed successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred');
        res.redirect('/profile');
    }
});



// Route to change password
router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
        if (newPassword !== confirmNewPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/profile');
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/profile');
        }

        const isOldPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

        if (!isOldPasswordCorrect) {
            req.flash('error', 'Old password is incorrect');
            return res.redirect('/profile');
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword);
        user.password = hashedNewPassword;
        await user.save();

        req.flash('success', 'Password changed successfully');
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred');
        res.redirect('/profile');
    }
});
module.exports = router 