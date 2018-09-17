const mongoose = require('mongoose');

let MessageSchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    room: {
        type: 'String',
        required: true
    }
});

let Message = module.exports = mongoose.model('Message', MessageSchema);
