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
        style: '/css/index.css',
        script: '/js/lecturerSignup.js'
    });
});

router.post('/register', (req, res) => {
    const body = req.body;
    const newLecturer = {
        name: body.name,
        username: body.lecturerUsername,
        password: body.lecturerPassword
    };

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('lecturerUsername', 'Invalid Username').notEmpty();
    req.checkBody('lecturerPassword', 'Password is required').notEmpty().isLength({min: 8});

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            title: 'Lecturer Registration',
            style: '/css/lecturerSignup.css',
            script: '/js/lecturerSignup.js',
            errors: errors,
            name: newLecturer.name,
            username: newLecturer.username,
            password: newLecturer.password
        });
    } else {
        let lecturer = new Lecturer({
            name: newLecturer.name,
            username: newLecturer.username,
            password: newLecturer.password
        });

        Lecturer.findOne({username: lecturer.username}, (err, foundLecturer) => {
            if (err) {
                return console.log(err);
            }
            if (foundLecturer) {
                res.render('/lecturers/register', {
                    title: 'Lecturer Registration',
                    style: '/css/lecturerSignup.css',
                    script: '/js/lecturerSignup.js',
                    error: 'Username already taken.',
                    name: newLecturer.name,
                    username: newLecturer.username,
                    password: newLecturer.password
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
    passport.authenticate('lecturer', (err, user, info) => {
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
            // res.redirect(`/lecturers/dashboard/${id}`);
            res.redirect(`/lecturers/${id}/joinChat`);
        });
    })(req, res, next);
});

router.get('/login', (req, res) => {
    res.render('lecturerLogin', {
        title: 'Lecturer Login',
        style: '/css/index.css',
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
            res.render('dashboard', {
                title: `${user.name} - Dashboard`,
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                id: user._id,
                name: user.name,
                time: date
            });
        }
    });
});

router.get('/:id/joinChat', ensureAuthenticated, (req, res) => {
    Lecturer.findOne({_id: req.params.id}, (err, returnedLecturer) => {
        if (err) {
            return console.log(err);
        } else {
            let lecturer = returnedLecturer;
            let name = lecturer.name.slice(0, lecturer.name.indexOf(' '));
            res.render('chatLogin', {
                title: 'Join | Chat',
                style: '/css/chatLogin.css',
                script: '/js/chatLogin.js',
                id: lecturer._id,
                name: `Lecturer: ${name}`
            });
        }
    });
});

module.exports = router;
