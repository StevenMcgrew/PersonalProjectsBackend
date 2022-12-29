require('dotenv').config();
let cookieSession = require('cookie-session');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');
let cors = require('cors');

// Import routes
let indexRouter = require('./routes/index');
const veCalculationsRouter = require('./routes/api/ve/calculations');
const { vehicleRepairsAuthRouter } = require('./routes/api/vehicle-repairs/auth');
const { vehicleRepairsImagesRouter } = require('./routes/api/vehicle-repairs/images');
const { vehicleRepairsPostsTagsRouter } = require('./routes/api/vehicle-repairs/posts_tags');
const { vehicleRepairsPostsRouter } = require('./routes/api/vehicle-repairs/posts');
const { vehicleRepairsTagsRouter } = require('./routes/api/vehicle-repairs/tags');
const { vehicleRepairsVehiclesRouter } = require('./routes/api/vehicle-repairs/vehicles');

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
app.use('/api/ve/calculations', veCalculationsRouter);
app.use('/api/vehicle-repairs/auth', vehicleRepairsAuthRouter);
app.use('/api/vehicle-repairs/images', vehicleRepairsImagesRouter);
app.use('/api/vehicle-repairs/posts_tags', vehicleRepairsPostsTagsRouter);
app.use('/api/vehicle-repairs/posts', vehicleRepairsPostsRouter);
app.use('api/vehicle-repairs/tags', vehicleRepairsTagsRouter);
app.use('/api/vehicle-repairs/vehicles', vehicleRepairsVehiclesRouter);

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
