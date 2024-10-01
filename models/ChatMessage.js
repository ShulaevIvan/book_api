const mongoose = require('mongoose');

const chatMessage = mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true
    },
    fromUserId: {
        type: String,
        required: true
    },
    toUserId: {
        type: String
    },
    fromUserName: {
        type: String
    },
    toUserName: {
        type: String
    },
})
module.exports = mongoose.model('chatMessages', chatMessage);