const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    level: {
        type: String
    },
    gender: {
        type: String,
        required: true
    }
});

let User = module.exports = mongoose.model('User', UserSchema);
