const mongoose = require('mongoose');

let FourHundredLevelSchema = mongoose.Schema({
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

let FourHundredLevelChat = module.exports = mongoose.model('FourHundredLevelChat', FourHundredLevelSchema);
