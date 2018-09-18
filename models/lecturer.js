const mongoose = require('mongoose');

let LecturerSchema = mongoose.Schema({
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
    gender: {
        type: String,
        required: true
    },
    messages: {
        type: String
    }
});

let Lecturer = module.exports = mongoose.model('Lecturer', LecturerSchema);
