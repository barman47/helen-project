const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();
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
    const body = req.body;
    const newLecturer = {
        name: body.name,
        email: body.email,
        username: body.username,
        password: body.password,
        confirmPassword: body.confirmPassword,
        gender: body.gender
    };

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Invalid Email Address').isEmail();
    req.checkBody('username', 'Invalid Username').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty().isLength({min: 8});
    req.checkBody('confirmPassword', 'Passwords do not match!').equals(newLecturer.password);
    req.checkBody('gender', 'Please Select your Gender').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            title: 'Lecturer Registration',
            style: '/css/lecturerSignup.css',
            script: '/js/lecturerSignup.js',
            errors: errors,
            name: newLecturer.name,
            email: newLecturer.email,
            username: newLecturer.username,
            password: newLecturer.password,
            confirmPassword: newLecturer.confirmPassword,
            gender: newLecturer.gender
        });
    } else {
        let lecturer = new Lecturer({
            name: newLecturer.name,
            email: newLecturer.email,
            username: newLecturer.username,
            password: newLecturer.password,
            gender: newLecturer.gender
        });

        Lecturer.findOne({username: lecturer.username}, (err, foundLecturer) => {
            if (err) {
                return console.log(err);
            }
            if (foundLecturer) {
                res.render('register', {
                    title: 'Lecturer Registration',
                    style: '/css/lecturerSignup.css',
                    script: '/js/lecturerSignup.js',
                    error: 'Username already taken',
                    name: newLecturer.name,
                    email: newLecturer.email,
                    username: newLecturer.username,
                    password: newLecturer.password,
                    confirmPassword: newLecturer.confirmPassword,
                    gender: newLecturer.gender
                });
            } else{
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return console.log(err);
                    }
                    bcrypt.hash(lecturer.password, salt, (err, hash) => {
                        if (err) {
                            return console.log(err);
                        }
                        lecturer.password = hash;
                        lecturer.save((err) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                req.flash('success', 'Registration Successful. You now now proceed to log in.');
                                res.redirect('/lecturers/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('failure', 'Incorrect username or Password.');
            return res.redirect('/lecturers/login')
        }

        req.logIn(user, (err) => {
            if (err) {
                return console.log(err);
            }
            let id = user._id;
            id = mongoose.Types.ObjectId(id);
            res.redirect(`/lecturers/dashboard/${id}`);
        });
    })(req, res, next);
});

router.get('/login', (req, res) => {
    res.render('lecturerLogin', {
        title: 'Lecturer Login',
        style: '/css/lecturerLogin.css',
        script: '/js/lecturerLogin.js'
    });
});

router.get('/dashboard/:id', ensureAuthenticated, (req, res) => {
    Lecturer.findOne({_id: req.params.id}, (err, user) => {
        if (err) {
            return console.log(err);
        } else {
            date = new moment();
            date =  date.format('h : mm a');
            res.send('Lecturer Logged In');
            // res.render('dashboard', {
            //     title: `${user.name} - Dashboard`,
            //     style: '/css/dashboard.css',
            //     script: '/js/dashboard.js',
            //     id: user._id,
            //     name: user.name,
            //     time: date
            // });
        }
    });
});

module.exports = router;
