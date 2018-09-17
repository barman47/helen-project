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
    password: {
        type: String,
        required: true
    },
    // regNo: {
    //     type: String,
    //     required: true
    // },
    gender: {
        type: String,
        required: true
    }
});

let User = module.exports = mongoose.model('User', UserSchema);