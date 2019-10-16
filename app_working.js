const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// For creating a server-side session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis   = require("redis");
const redisStore = require('connect-redis')(session);

const client = redis.createClient();
client.on("error", function (err) {
    console.log("Error " + err);
});

// For the middleware to pass urls other than /register, /login without session
const cookieSession = require('cookie-session')

// URL routes
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

app.use(cookieParser());

// Use the session middleware
app.use(session({
    secret: "invoice_session_sec",
    name: "mySession",
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400 }
}));


// Middleware to check if user logged in
app.use(function (req, res, next) {

    // if in any of the following urls, session status will not be checked
    if(['/','/user/login','/user/register','/user/logout'].includes(req.url)){
        next();
    }
    else{
        console.log("req.session.user",req.session.user);
        if(req.session.hasOwnProperty('user')){
            // res.header("Access-Control-Allow-Origin", "*");
            // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        }
        else{
            res.status(401).send({
                status: "error",
                err_code: "UNAUTHORIZED",
                message: "User not logged in. Please logout and retry logging in"
            });
        }
    }
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Allowing JSON to be parsed as request parameter
app.use(bodyParser.json({type: '*/*'}));

// Connecting the public directory to app
app.use(express.static(path.join(__dirname, 'public')));

// Allowing Cross-Origin Resource Sharing (CORS)
app.use(cors());

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