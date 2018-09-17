const mongoose = require('mongoose');

let ThreeHundredLevelSchema = mongoose.Schema({
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

let ThreeHundredLevelChat = module.exports = mongoose.model('ThreeHundredLevelChat', ThreeHundredLevelSchema);
