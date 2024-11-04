require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var annoncesRouter = require('./routes/annonces');
let profilesRouter = require('./routes/profiles');
let propositionCollab = require('./routes/propositionCollabs');
let messagesRouter = require('./routes/messages');
var app = express();
const cors = require('cors');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/annonces', annoncesRouter);
app.use('/profiles', profilesRouter);
app.use('/propositionCollabs', propositionCollab);
app.use('/messages', messagesRouter);

module.exports = app;
