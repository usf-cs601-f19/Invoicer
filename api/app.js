const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const productsRouter = require('./routes/product');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({type: '*/*'}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/product', productsRouter);

// Custom Logs
Object.defineProperty(global, '__stack', {
    get: function() {
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        const err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        const stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__function', {
    get: function() {
        return __stack[1].getFunctionName();
    }
});

module.exports = app;