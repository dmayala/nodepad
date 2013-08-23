var express = require('express');
var http = require('http');
var path = require('path');
var app = module.exports = express();
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

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
    key: 'nodepad',
    secret: 'my secret',
    cookie: {expires: false},
    store: new MongoStore({db: 'nodepad-development'})
  }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', loadUser, function (req, res) {
  res.redirect('/documents');
});

// DOCUMENTS //
// List Documents
app.get('/documents.:format?', loadUser, docRoute.listDoc);

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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
