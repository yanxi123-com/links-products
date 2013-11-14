
/*
 * Copyright(c) qiri.com <yanxi@yanxi.com>
 */
 
var express = require('express'),
    config = require('./config'),
    http = require('http'),
    fs = require('fs'),
    qiriError = require('./model/qiri-err'),
    routes = require('./routes/route'),
    accessLogfile = fs.createWriteStream(__dirname + '/var/logs/access.log', {flags: 'a'}),
    app = express(),
    path = require('path'),
    ejs = require('ejs');

ejs.open = '{%';
ejs.close = '%}';

app.configure(function() {
    app.set('port', config.get('port'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
    app.use(express.logger({
        stream: accessLogfile,
        // http://www.senchalabs.org/connect/middleware-logger.html
        format: ":date :method :url :status :res[content-length] - :response-time ms :user-agent"
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.get('cookieSecret')));
  
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public'), {maxAge: 1000 * 3600 * 24 * 30}));
  
    app.use(qiriError.qiriErrorHandler);
    app.use(qiriError.errorHandler);
});

// management
app.get('/manage', routes.manage);
app.get('/manage/n:id', routes.manage);
app.post('/manage/login', routes.login);
app.post('/manage/operation', routes.operation);

//home
app.get(/^\/(|skincare|makeup|men|perfume|health)\/?$/, routes.home);

// 404
app.use(function(req, res, next) {
    res.status(404);
    res.render('error', {
        title : '页面不存在'
    });
});

app.locals({
    node : null,
});

var server = http.createServer(app);
server.setMaxListeners(100);
server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

