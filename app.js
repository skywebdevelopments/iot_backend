var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//authentacation
const GoogleStrategy=require('./auth/GoogleStrategy');
const passport = require("passport");
const GoogleRouter=require("./routes/google.user.iot")

//UserLogin
var usersRouter = require('./routes/users.login.iot');
//usersgroups
var u_groupRoute = require('./routes/u_group.iot.route');
var cors = require('cors')
var indexRouter = require('./routes/index');
// routes for the iot
var s_groupRoute = require('./routes/s_group.iot.route')
var sensorRoute = require('./routes/sensor.iot.route')
var mqttRoute = require('./routes/mqttuser.iot.route')

var logRoute = require('./routes/logs.iot')

// end
const bodyParser = require("body-parser");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
  uploadDir: './uploads'
});



var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Google login and login
app.use(passport.initialize());
app.use('/auth',GoogleRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/u_group', u_groupRoute);

app.use(express.static(path.join(__dirname, 'public')));
// model routes
app.use('/api/v1/', indexRouter);

// routes/microservices for the iot 
app.use('/api/v1/s_group', s_groupRoute);
app.use('/api/v1/sensor', sensorRoute);
app.use('/api/v1/mqttuser', mqttRoute);
app.use('/api/v1/logs', logRoute);



// 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
