var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressValidator = require('express-validator');

var routes = require('./routes/index');

var consolidate = require('consolidate');
var config = require('./config/config.js');
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// assign the template engine to .html files
app.engine('html', consolidate[config.templateEngine]);
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public', '/images/favicon.png')));

// cookie parsing
app.use(cookieParser());

app.use(session({
  secret: config.sessionSecret,
  cookie: config.sessionCookie,
  name: config.sessionName,
  resave: true,
  saveUninitialized: true
}));


// For passport strategies
// require('./config/passport.js');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(expressValidator()); // For req parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(methodOverride());

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.error(err.stack);
    res.render('error', {
      message: err.message,
      stack: err.stack,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
