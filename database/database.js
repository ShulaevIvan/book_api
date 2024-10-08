const fs = require('fs');
const path = require('path'); 
const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const bookCollection = require('../models/Book');

class Database {
    constructor() {
        this.bookStore = undefined;
    }

    async connect() {
        try {
            await mongoose.connect(`${process.env.DATABASE_URL}`)
            .then((data) => {
                console.log('connected to db - ok');
            })
            .catch((err) => {
                console.log(err);
                console.log('connected to db - err');
            })
        }
        catch(err) {
            console.log('connected to db - err');
        }
    }

    async getBooks(id, many=true) {
        try {
            if (id && !many) {
                return new Promise((resolve, reject) => {
                    bookCollection.findOne({id:id})
                    .then((book) => {
                        if (book) resolve(book);
                    })
                    .catch((err) => {
                        console.log('err to get book by id')
                    })
                });
            }
            return new Promise((resolve, reject) => {
                bookCollection.find()
                .then((books) => {
                    resolve(books);
                })
                .catch((err) => {
                    console.log('cant get books');
                    reject(err);
                });
            });
        }
        catch(err) {
            console.log(err);
            console.log('err to get books');
        }
    }

    async createBook(reqData) {
        try {
            return new Promise((resolve, reject) => {
                const uploadData = reqData.body;
                uploadData.fileBook = reqData.file ? reqData.file.path : 'public/uploads/book_holder.png';
                uploadData.fileName = reqData.file ? reqData.file.filename : 'book_holder.png';

                const book = {
                    id: uuid(),
                    title: uploadData.title,
                    description: uploadData.description,
                    authors: uploadData.authors,
                    favorite: uploadData.favorite,
                    fileCover: uploadData.fileCover,
                    fileName: uploadData.fileName,
                    counter: 0,
                    fileBook: uploadData.fileBook ? uploadData.fileBook : path.join(__dirname, '..', '/public/uploads/book_holder.png'),
                };
                const bookObj = bookCollection.create(book);
                resolve(bookObj);
            });
        }
        catch(err) {
            console.log(err);
            console.log('err to create book');
        }
    }

    async editBook(reqData) {
        return new Promise((resolve, reject) => {
            const targetId = reqData.params.id;
            const uploadData = reqData.body;
            uploadData.fileBook = reqData.file ? reqData.file.path : 'public/uploads/book_holder.png';
            uploadData.fileName = reqData.file ? reqData.file.filename : 'book_holder.png';
            bookCollection.findOneAndUpdate({id: targetId}, uploadData)
            .then((data) => {
                resolve(data);
            })
        });
    }

    async deleteBook(bookId) {
        try {
            return new Promise((resolve, reject) => {
                bookCollection.find({id: bookId})
                .then((book) => {
                    if (book && book[0] && book[0].fileName !== `book_holder.png`) {
                        if (fs.existsSync(`public/uploads/${book[0].fileName}`)) {
                            fs.unlink(`public/uploads/${book[0].fileName}`, err => {
                                if(err) throw err;
                            });
                        }
                    }
                    const bookObj = bookCollection.deleteOne({id: bookId});
                    resolve(bookObj);
                })
                
            });
        }
        catch(err) {
            console.log(err);
            console.log('err to delete book');
        }
    }

    async downloadBookImage(bookId) {
        try {
            return new Promise((resolve, reject) => {
                bookCollection.find({id: bookId})
                .then((data) => {
                    if (data && data.length > 0) {
                        const filePath = path.join(__dirname, '..', `/public/uploads/${data[0].fileName}`);
                        resolve(filePath);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    reject('');
                })
            });
        }
        catch(err) {
            console.log(err);
        }
    }

    async incrViewCounter(bookId, value) {
        try {
            await bookCollection.updateOne({id: bookId}, {counter: value});
        }
        catch(err) {
            console.log(err);
            console.log('err to set counter value');
        }
    }
};

module.exports = new Database();