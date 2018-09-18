const mongoose = require('mongoose');

let LecturerMessageSchema = mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    lecturerName: {
        type: String,
        required: true
    },
    message: {
        type: 'String',
        required: true
    }
    time: {
        type: String,
        required: true
    }
});

let LecturerMessage = module.exports = mongoose.model('LecturerMessage', LecturerMessageSchema);
