const mongoose = require('mongoose');

let TwoHundredLevelSchema = mongoose.Schema({
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

let TwoHundredLevelChat = module.exports = mongoose.model('TwoHundredLevelChat', TwoHundredLevelSchema);
