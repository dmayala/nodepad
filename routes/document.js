var Document = require('../models').Document();

exports.listDoc = function(req, res) {
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
};

exports.editDoc = function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    res.render('documents/edit.jade', { d: d });
  });
};

exports.newDoc = function(req, res) {
  res.render('documents/new.jade', { d: new Document() });
};

exports.createDoc = function(req, res) {
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
};

exports.readDoc = function(req, res) {
  Document.findById(req.params.id, function(err, d) {
    switch (req.params.format) {
      case 'json':
        res.send(d);
      break;

      default:
        res.render('documents/show.jade', { d: d });
    }
  });
};

exports.updateDoc = function(req, res) {
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
};

exports.delDoc = function(req, res) {
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
};