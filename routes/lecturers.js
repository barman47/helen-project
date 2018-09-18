const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
// const expressValidator = require('express-validator');
const router = express.Router();
// router.use(expressValidator());
const moment = require('moment');
const path = require('path');
const publicPath = path.join(__dirname, 'public');
const User = require('../models/user');
const Lecturer = require('../models/lecturer');
const {ensureAuthenticated} = require('../utils/access-control');

let time = moment();
time = time.format('h:mma');
let date;

router.get('/register', (req, res) => {
    res.render('lecturerSignup', {
        title: 'Lecturer Registration',
        style: '/css/lecturerSignup.css',
        script: '/js/lecturerSignup.js'
    });
});

router.post('/register', (req, res) => {
    res.render('lecturerSignup', {
        title: 'Lecturer Registration',
        style: '/css/lecturerSignup.css',
        script: '/js/lecturerSignup.js'
    });
});

router.get('/login', (req, res) => {
    res.render('lecturerLogin', {
        title: 'Lecturer Login',
        style: '/css/lecturerLogin.css',
        script: '/js/lecturerLogin.js'
    });
});

router.post('/login', (req, res) => {
    res.render('lecturerSignup', {
        title: 'Lecturer Registration',
        style: '/css/lecturerSignup.css',
        script: '/js/lecturerSignup.js'
    });
});

module.exports = router;
