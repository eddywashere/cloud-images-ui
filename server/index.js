var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')({ session: session });
var bodyParser = require('body-parser');
var Authentication = require('./authentication');
var passport = require('passport');
var flash = require('connect-flash');
var cors = require('cors');
var corsOptions = {
  origin: '*'
};
// praxy stuff - move to praxy middleware repo ;]
var httpProxy = require('http-proxy');
var proxy = new httpProxy.createProxyServer();
var Url = require('url');
var _ = require('lodash');
// routes
var routes = require('./routes/index');

// express setup
var app = express();

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({
  secret: 'chachachangeme!!!',
  store: new MongoStore({
    url: process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/cloud-images-ui',
    auto_reconnect: true
  })
}));
// setup passport authentication
app.use(passport.initialize());
app.use(passport.session());
// other
app.use(flash());
app.use(cors());

app.get('/', function(req, res){
  res.render('index', { user: req.user, title: 'Dashboard' });
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

passport.use(Authentication.keystoneStrategy);
passport.serializeUser(Authentication.serializeUser);
passport.deserializeUser(Authentication.deserializeUser);

// setup routes
app.use('/', routes);
app.all('/proxy*', function (req, res) {
  req.removeAllListeners('data')
  req.removeAllListeners('end')
  process.nextTick(function () {
    if(req.body) {
      req.emit('data', JSON.stringify(req.body))
    }
    req.emit('end')
  })
  // todo
  //
  // add options
  // - input custom headers like user-agent
  // - override token
  // - input service catalog else return FALSE (hack service catalog before this middleware)
  // handle missing requirements
  if(!req.user || !req.user.token){
    return res.json(403, {error: 'Not Authenticated'})
  }
  if (!req.user.serviceCatalog) {
    return res.json(400, {error: 'Missing Service Catalog'})
  }

  // parse service obj and region from req.url
  var service, reqPaths, endpoint, endpointInfo, target,
  parseService = function(service){
    var segments = service.split(',');
    if (segments.length === 2) {
      return {
        name: segments[0],
        region: segments[1]
      };
    }
    return {
      name: segments,
    };
  };

  req.url = req.url.split('/proxy/')[1]; // remove /proxy/
  service = req.url.split('/')[0]; // grabs 'serviceName,[region]'
  req.url = req.url.split(service)[1]; // transform req.url

  var serviceInfo = parseService(service);
  if (!req.user.serviceCatalog[serviceInfo.name]){
    console.log('endpoint not found')
    return res.json(404, {error: 'Endpoint Not Found'})
  }
  if (!req.user.serviceCatalog[serviceInfo.name].endpoints[serviceInfo.region]){
    console.log('region not found')
    return res.json(404, {error: 'Region Not Found'})
  }
  if (serviceInfo.region){
    endpoint = req.user.serviceCatalog[serviceInfo.name].endpoints[serviceInfo.region].publicURL
  } else {
    endpoint = req.user.serviceCatalog[serviceInfo.name].endpoints['default'].publicURL;
  }
  endpointInfo = Url.parse(endpoint);
  target = endpoint.split(endpointInfo.path)[0];
  req.url = endpointInfo.pathname + '/' + req.url;

  // replace headers
  req.headers = {};
  req.headers['X-Auth-Token'] = req.user.token;
  req.headers['Accept'] = 'application/json';
  req.headers['Content-Type'] = 'application/json';
  req.headers['User-Agent'] = 'Rackspace Custom Dashboard';

  proxy.web(req, res, {
    target: target
  });

  // proxy.on('end', function(req, res, proxyRes) {
  //   console.log(req.headers);
  // })

  // debugging info
  // var data = {
  //   url: req.url,
  //   route: req.route.path,
  //   body: req.body,
  //   target: target,
  //   serviceInfo: serviceInfo,
  //   headers: req.headers
  // };
  // console.log(data);

  proxy.on('error', function (err, req, res) {
    console.log(err);
    res.json(500, { error: err })
  });
});

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
