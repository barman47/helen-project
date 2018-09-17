const mongoose = require('mongoose');

let HundredLevelSchema = mongoose.Schema({
    messages: {
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
    }
});

let HundredLevelChat = module.exports = mongoose.model('HundredLevelChat', HundredLevelSchema);
