const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    id: {
        type:String,
        trim: true,
        default: '',
    },
    title: {
        type:String,
        trim: true,
        default: '',
    },
    description: {
        type:String,
        trim: true,
        default: '',
    },
    authors: {
        type:String,
        trim: true,
        default: '',
    },
    favorite: {
        type:String,
        trim: true,
        default: '',
    },
    fileCover: {
        type:String,
        trim: true,
        default: '',
    },
    fileName: {
        type:String,
        trim: true,
        default: '',
    },
    counter: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('Book', bookSchema);