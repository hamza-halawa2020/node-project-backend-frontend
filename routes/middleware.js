const express = require("express")
const router = express.Router()
const user = require('../models/user.js')
const passport = require("passport")

isAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()) return next()
    res.redirect('/login')
}


module.exports = isAuthenticated 