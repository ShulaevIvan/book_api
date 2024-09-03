const path = require('path'); 
const router = require('express').Router();
const { v4: uuid } = require('uuid');
const bookCollection = require('../models/Book');

router.get('/books', async (req, res) => {
    try {
        await bookCollection.find().select(['-counter', '-__v', '-_id'])
        .then((books) => {
            res.status(200).json({data: books});
        })
        .catch((err) => {
            console.log('cant get books (GET)');
            console.log(err);
            res.status(500).json({status: 'err 500'});
        }); 
    }
    catch(err) {
        console.log(err);
        res.status(500).json({status: 'err (GET) books'});
    }
});

router.get('/books/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        await bookCollection.find({id: targetId}).select(['-counter', '-__v', '-_id'])
        .then((book) => {
            res.status(200).json({data: book});
        })
        .catch((err) => {
            res.status(500).json({status: 'err cant get book (GET)'});
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({status: 'err cant get book (GET)'});
    }
});

router.post('/books', async (req, res) => {
    try {
        const uploadData = req.body;
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
        await bookCollection.create(book)
        .then((book) => {
            res.status(201).json({data: book});
        })
        .catch((err) => {
            res.status(500).json({status: 'err cant create book (POST)'});
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({status: 'cant create book (POST)'});
    }
});

router.delete('/books/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        await bookCollection.deleteOne({id: targetId}).select(['-__v', '-_id', 'counter'])
        .then(() => {
            res.status(200).json({status: 'ok'});
        })
        .catch((err) => {
            res.status(200).json({status: 'ok'});
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({status: 'err cant delete book (PUT)'});
    }
});

router.put('/books/:id', async (req, res) => {
    try {
        const uploadData = req.body;
        const targetId = req.params.id;
        if (uploadData.fileName) {
            uploadData.fileBook = req.file ? req.file.path : 'public/uploads/book_holder.png';
            uploadData.fileName = req.file ? req.file.filename : 'book_holder.png';
        }
        else uploadData.fileName = 'book_holder.png';

        await bookCollection.findOneAndUpdate({id: targetId}, uploadData).select(['-counter', '-__v', '-_id'])
        .then(() => {
            bookCollection.findOne({id: targetId}).select(['-counter', '-__v', '-_id'])
            .then((book) => {
                if (!book) {
                    res.status(404).json({status: 'not found'});
                    return;
                }
                res.status(201).json({data: book});
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({status: 'err cant get book (GET)'});
            });
            
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({status: 'err cant update book (PUT)'});
        });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({status: 'err cant update book (PUT)'});
    }
})

module.exports = router;