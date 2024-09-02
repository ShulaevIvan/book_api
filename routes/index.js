const express = require('express');
const router = express.Router();
const database = require('../database/database');

router.get('/', async (req, res) => {
    try {
        database.getBooks()
        .then((books) => {
            res.status(200);
            res.render('index', {books: books});
        });
    }
    catch(err) {
        res.status(500);
        console.log(`cant get books from '/' ${err} `);
        res.render('index', {books: 'test'});
    }
   
});

module.exports = router;