const express = require('express');
const mongoose = require('mongoose');
const app = express();
const socketIO = require('socket.io');
const env = require('dotenv').config();
const path = require('path');
const server = require('http').createServer(app);
module.exports = require("socket.io")(server);
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const apiRouter = require('./routes/api');
const database = require('./database/database');
const chat = require('./ws/chat');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/uploads/')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

database.connect();
app.use('/', indexRouter);
app.use('/', booksRouter);
app.use('/api', apiRouter);
// mongoose.connection.collection('chatusers').drop()
// mongoose.connection.collection('chatmessages').drop()
server.listen(PORT);
console.log(`server started at: \n ${HOST}:${PORT}`);