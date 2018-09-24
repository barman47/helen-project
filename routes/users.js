const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();
const moment = require('moment');
const path = require('path');
const publicPath = path.join(__dirname, 'public');
const User = require('../models/user');
const {ensureAuthenticated} = require('../utils/access-control');

let time = moment();
time = time.format('h:mma');
let date;

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Student Sign up',
        style: '/css/index.css',
        script: '/js/userSignup.js'
    });
});

router.post('/register', (req, res) => {
    const body = req.body;
    const newUser = {
        name: body.name,
        email: body.email,
        username: body.studentUsername,
        password: body.studentPassword,
        confirmPassword: body.confirmPassword,
        gender: body.gender
    };

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Invalid Email Address').isEmail();
    req.checkBody('studentUsername', 'Invalid Username').notEmpty();
    req.checkBody('studentPassword', 'Password is required').notEmpty().isLength({min: 8});
    req.checkBody('confirmPassword', 'Passwords do not match!').equals(newUser.password);
    req.checkBody('gender', 'Please Select your Gender').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            title: 'Student Sign up',
            style: '/css/index.css',
            errors: errors,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            password: newUser.password,
            confirmPassword: newUser.confirmPassword,
            gender: newUser.gender
        });
    } else {
        let user = new User({
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            password: newUser.password,
            gender: newUser.gender
        });

        User.findOne({username: user.username}, (err, foundUser) => {
            if (err) {
                return console.log(err);
            }
            if (foundUser) {
                res.render('register', {
                    title: 'Sign up',
                    style: '/css/index.css',
                    error: 'Username already taken',
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    password: newUser.password,
                    confirmPassword: newUser.confirmPassword,
                    gender: newUser.gender
                });
            } else{
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return console.log(err);
                    }
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) {
                            return console.log(err);
                        }
                        user.password = hash;
                        user.save((err) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                req.flash('success', 'Registration Successful. You now now proceed to log in.');
                                res.redirect('/');
                            }
                        });
                    });
                });
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('student', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('failure', 'Incorrect username or Password.');
            return res.render('index', {
                title: 'Student Login',
                style: '/css/index.css',
                script: '/js/index.js',
                username: req.body.username,
                password: req.body.password
            });
        }

        req.logIn(user, (err) => {
            if (err) {
                return console.log(err);
            } else {
                let id = user._id;
                id = mongoose.Types.ObjectId(id);
                res.redirect('/users/dashboard/' + id);
            }
        });
    })(req, res, next);
});

router.get('/dashboard/:id', ensureAuthenticated, (req, res) => {
    User.findOne({_id: req.params.id}, (err, user) => {
        if (err) {
            return console.log(err);
        } else {
            date = new moment();
            date =  date.format('h : mm a');
            res.render('dashboard', {
                title: `${user.name} - Dashboard`,
                style: '/css/dashboard.css',
                script: '/js/dashboard.js',
                user,
                time: date
            });
        }
    });
});

router.get('/:id/joinChat', ensureAuthenticated, (req, res) => {
    User.findOne({_id: req.params.id}, (err, returnedUser) => {
        if (err) {
            return console.log(err);
        } else {
            let user = returnedUser;
            let name = user.name.slice(0, user.name.indexOf(' '));
            res.render('chatLogin', {
                title: 'Join | Chat',
                style: '/css/chatLogin.css',
                script: '/js/chatLogin.js',
                id: user._id,
                name
            });
        }
    });
});

router.put('/dashboard/:id', ensureAuthenticated, (req, res) => {
    let data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        level: req.body.level
    };

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return console.log(err);
        }
        bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) {
                return console.log(err);
            }
            data.password = hash;
            let query = {_id: req.params.id};
            User.findOneAndUpdate(query, {$set: {
                name: data.name,
                email: data.email,
                password: data.password,
                level: data.level
            }}, {new: true}, (err, updatedUser) => {
                if (err) {
                    return console.log(err);
                } else {
                    res.status(200).end();
                }
            });
        });
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
});

module.exports = router;
