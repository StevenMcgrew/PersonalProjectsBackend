require('dotenv').config();
let cookieSession = require('cookie-session');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');
let cors = require('cors');

// Import routes
let indexRouter = require('./routes/index');
let apiVeCalculations = require('./routes/api/ve/calculations');
let apiVehicleRepairsAuth = require('./routes/api/vehicle-repairs/auth');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    secret: process.env.SESSION_SECRET,
    maxAge: 34560000 * 1000, // 400 days (The draft of rfc6265bis now contains an upper limit of 400 days)
    httpOnly: true
}));

// Register routes
app.use('/', indexRouter);
app.use('/api/ve/calculations', apiVeCalculations);
app.use('/api/vehicle-repairs/auth', apiVehicleRepairsAuth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
