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
    }
});

let Lecturer = module.exports = mongoose.model('Lecturer', LecturerSchema);
