var express = require('express')
  , http = require('http')
  , path = require('path') 
  , app = module.exports = express()
  , mongoose = require('mongoose');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Connect to databse
mongoose.connect('mongodb://localhost/nodepad-development');

//Models 
var Document = require('./models').Document();

app.get('/', function(req, res) {
  res.redirect('/documents');
});

// Document list
app.get('/documents.:format?', function(req, res) {
  Document.find(function(err, documents) {
    switch (req.params.format) {
      case 'json':
        res.send(documents.map(function(d) {
          return d;
        }));
        break;

      default:
        res.render('documents/index.jade', { documents: documents });
    }
  });
});

app.get('/documents/:id.:format?/edit', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    res.render('documents/edit.jade', { d: d });
  });
});

app.get('/documents/new', function(req, res) {
  res.render('documents/new.jade', { d: new Document() });
});

// Create document 
app.post('/documents.:format?', function(req, res) {
  var d = new Document(req.body.document);
  d.save(function() {
    switch (req.query.format) {
      case 'json':
        res.send(d);
       break;

       default:
        res.redirect('/documents');
    }
  });
});

// Read document
app.get('/documents/:id.:format?', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    switch (req.params.format) {
      case 'json':
        res.send(d);
      break;

      default:
        res.render('documents/show.jade', { d: d });
    }
  });
});

// Update document
app.put('/documents/:id.:format?', function(req, res) {
  Document.findById(req.body.document.id, function(err, d) {
    d.title = req.body.document.title;
    d.data = req.body.document.data;
    d.save(function() {
      switch (req.query.format) {
        case 'json':
          res.send(d);
         break;

         default:
          res.redirect('/documents');
      }
    });
  });
});

// Delete document
app.del('/documents/:id.:format?', function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    d.remove(function() {
      switch (req.params.format) {
        case 'json':
          res.send('true');
         break;

         default:
          res.redirect('/documents');
      } 
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
