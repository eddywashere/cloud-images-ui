var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var Authentication = require('./authentication');
var passport = require('passport');
var flash = require('connect-flash');
var cors = require('cors');
var corsOptions = {
  origin: '*'
};

// routes
var routes = require('./routes/index');

// express setup
var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'chachachangeme' }));
app.use(flash());
app.use(cors());

app.get('/', function(req, res){
  res.render('index', { user: req.user, title: 'fooooo' });
});

if (app.get('env') === 'production') {
  app.set('views', __dirname + '/../dist');
  app.use(express.static(__dirname + '/../dist'));
} else {
  app.set('views', __dirname + '/../app');
  app.use(express.static(__dirname + '/../app'));
  app.use('/styles', express.static(__dirname + '/../.tmp/styles'));
}
app.set('view engine', 'html');
app.engine('html', require('ejs-locals'));

// setup passport authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(Authentication.keystoneStrategy);
passport.serializeUser(Authentication.serializeUser);
passport.deserializeUser(Authentication.deserializeUser);

// setup routes
app.use('/', routes);
// app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
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
