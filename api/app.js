const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const productsRouter = require('./routes/product');
const customerRouter = require('./routes/customer');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
// Use the session middleware
app.use(session({
    secret: "Alkantara",
    name: "mySession",
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400 }
}));
app.use(bodyParser.json({type: '*/*'}));
app.use(express.static(path.join(__dirname, 'public')));

// All the routers defined above
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/product', productsRouter);
app.use('/customer', customerRouter);

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