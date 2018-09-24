const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Lecturer = require('../models/lecturer');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
    passport.use('student', new LocalStrategy({
        usernameField: "studentUsername",
        passwordField: "studentPassword",
        passReqToCallback: true
      }, function verifyCallback(req, studentUsername, studentPassword, done) {
            User.findOne({ username: studentUsername }, function(err, user) {
            if (err) return done(err);
            if (!user) {
                return done(null, false, {msg: 'No student found'});
            }
            bcrypt.compare(studentPassword, user.password, (err, isMatch) => {
                if (err) return done(err);
                if (!isMatch) {
                    return done(null, false, {msg: 'Incorrect Password'});
                } else {
                    return done(null, user);
                }
            });
        });
    }));

    passport.use('lecturer', new LocalStrategy({
        usernameField: 'lecturerUsername',
        passwordField: 'lecturerPassword',
        passReqToCallback: true
    }, function verifyCallback (req, lecturerUsername, lecturerPassword, done) {
        Lecturer.findOne({username: lecturerUsername}, (err, lecturer) => {
            if (err) {
                return done (err);
            }

            if (!Lecturer) {
                return done(null, false, {msg: 'No Lecturer found'});
            }
            bcrypt.compare(lecturerPassword, lecturer.password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done (null, false, {msg: 'Incorrect Password'});
                } else {
                    return done(null, lecturer);
                }
            });
        });
    }));

    let SessionConstructor = function (userId, userGroup, details) {
        this.userId = userId;
        this.userGroup = userGroup;
        this.details = details;
    }

    passport.serializeUser(function (userObject, done) {
    // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
    let userGroup = "User";
    let userPrototype =  Object.getPrototypeOf(userObject);

    if (userPrototype === User.prototype) {
        userGroup = "User";
    } else if (userPrototype === Lecturer.prototype) {
        userGroup = "Lecturer";
    }

    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
        done(null,sessionConstructor);
    });

    passport.deserializeUser(function (sessionConstructor, done) {
        if (sessionConstructor.userGroup == 'User') {
            User.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
                done(err, user);
            });
        } else if (sessionConstructor.userGroup == 'Lecturer') {
            Lecturer.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.password', function (err, lecturer) { // When using string syntax, prefixing a path with - will flag that path as excluded.
                done(err, lecturer);
            });
        }
    });
};
