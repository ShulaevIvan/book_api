const mongoose = require('mongoose');

const chatUser = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    chatId: {
        type: String
    },
    online: {
        type: Boolean,
    },
})
module.exports = mongoose.model('chatUsers', chatUser);