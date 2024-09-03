const express = require('express');
const router = express.Router();
const database = require('../database/database');
const uploadMiddleware = require('../middleware/bookFileLoad');

router.get('/create', async (req, res) => {
    try {
        res.status(200);
        res.render('books/create');
    }
    catch(err) {
        res.status(500);
        console.log(`cant create book from '/create' ${err} `);
        res.redirect('/');
    }
    
});

router.post('/create', uploadMiddleware.single('fileBook'), async (req, res) => {
    try {
        await database.createBook(req)
        .then((data) => {
            res.status(201);
            res.redirect('/');
        });
    }
    catch(err) {
        res.status(500);
        console.log(`cant create book (POST) from '/create' ${err} `);
        res.redirect('/');
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await database.deleteBook(bookId)
        .then((data) => {
            res.redirect('/');
        })
        
    }
    catch(err) {
        res.status(500);
        console.log(`cant delete book (get) from '/create' ${err} `);
        res.redirect('/');
    }
});

router.get('/view/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        await database.getBooks(targetId, many=false)
        .then((targetBook) => {
            res.render('books/view', { book: targetBook });
        })
        
    }
    catch(err) {

    }
});

router.get('/update/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        await database.getBooks(targetId, many=false)
        .then((targetBook) => {
            res.render('books/update', { book: targetBook });
        });
    }
    catch(err) {
        res.status(500);
        console.log('err to update (GET) book');
    }
});

router.post('/update/:id', uploadMiddleware.single('fileBook'), async (req, res) => {
    try {
        await database.editBook(req)
        .then((data) => {
            res.status(201);
            res.redirect('/');
            return;
        })
        .catch((err) => {
            res.status(500);
            console.log('err to update (POST) book');
        });
    }
    catch(err) {
        res.send(err);
    }
});

module.exports = router;