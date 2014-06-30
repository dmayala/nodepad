var express = require('express');
var http = require('http');
var path = require('path');
var sys = require('sys');
var app = module.exports = express();
var stylus = require('stylus');
var flash = require('connect-flash');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongostore')(express);

//Routes
var docRoute = require('./routes/document');
var userRoute = require('./routes/user');
var sessionRoute = require('./routes/session');

//Middlewares
var loadUser = require('./middleware/user').loadUser;
//Connect to database
var db = mongoose.connect('mongodb://localhost/nodepad-development');

var hbs = require('hbs');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    key: 'nodepad',
    secret: 'my secret',
    store: new MongoStore({db: 'nodepad-development'})
  }));
app.use(express.methodOverride());
app.use(flash());
hbs.registerHelper('meh', function(name, version) {
  return name + ' v' + version;
});
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
app.use(function(req, res, next){
    res.locals.myVar = require('./helpers').helpers(req, res);
    next();
  });
app.use(app.router);
app.use(stylus.middleware({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// Handle 404
app.use(function(req, res) {
  res.status(404);
  res.render('404', {layout: false});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500);
  res.render('500', {layout: false, error: error});
});

// development only
if ('development' == app.get('env')) {
  //do nothing for now
}

app.get('/', loadUser, function (req, res) {
  res.redirect('/documents');
});

// DOCUMENTS //
// List Documents
app.get('/test', loadUser, function (req, res) {
  res.render('index', { currentUser: req.currentUser });
});

app.get('/documents.:format?', loadUser, docRoute.listDoc);

// Get Document Titles
app.get('/documents/titles.json', loadUser, docRoute.listTitle);

// Edit Document
app.get('/documents/:id.:format?/edit', loadUser, docRoute.editDoc);

// New Document
app.get('/documents/new', loadUser, docRoute.newDoc);

// Create document 
app.post('/documents.:format?', loadUser, docRoute.createDoc);

// Read document
app.get('/documents/:id.:format?', loadUser, docRoute.readDoc);

// Update document
app.put('/documents/:id.:format?', loadUser, docRoute.updateDoc);

// Delete document
app.del('/documents/:id.:format?', loadUser, docRoute.delDoc);

// USERS //
//New user
app.get('/users/new', userRoute.newUser);

//Create user
app.post('/users.:format?', userRoute.createUser);

// SESSIONS //
//New session
app.get('/sessions/new', sessionRoute.newSes);

//Create session
app.post('/sessions', sessionRoute.createSes);

//Delete session
app.del('/sessions', loadUser, sessionRoute.delSes);

//Search
app.post('/search.:format?', loadUser, docRoute.search)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
