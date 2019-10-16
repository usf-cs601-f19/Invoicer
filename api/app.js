const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// For the middleware to pass urls other than /register, /login
const cookieSession = require('cookie-session')

const cors = require('cors');

const path = require('path');
const bodyParser = require('body-parser');

const user = require('./models/user')
const User = new user();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const productsRouter = require('./routes/product');
const customerRouter = require('./routes/customer');

// Creating the web app from express
const app = express();

app.use(cookieSession({
    name: 'mySession',
    keys: ['key1', 'key2']
}))

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
// Allowing JSON to be parsed as request parameter
app.use(bodyParser.json({type: '*/*'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


// Middleware to check if user logged in
app.use(function (req, res, next) {

    // if in any of the following urls, session status will not be checked
    if(['/','/user/login','/user/register'].includes(req.url)){
        next();
    }
    else if(req.headers.hasOwnProperty('authorization')){
        User.authenticateToken(req, res, next);
    }
    else{
        res.status(401).send({
            status: "error",
            err_code: "UNAUTHORIZED",
            message: "User is not logged in"
        });
    }
})


// All the routers defined above
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/product', productsRouter);
app.use('/customer', customerRouter);

// Custom Console Logs
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