var Document = require('../models').Document();
var markdown = require('markdown').markdown;

exports.listDoc = function(req, res) {
  Document.find({user_id: req.currentUser.id}, function(err, documents) {
    switch (req.params.format) {
      case 'json':
        res.send(documents.map(function(d) {
          return d;
        }));
        break;

      default:
        res.render('documents/index.jade', { documents: documents, currentUser: req.currentUser });
    }
  });
};

exports.editDoc = function(req, res, next) {
  Document.findOne({ _id: req.params.id, user_id: req.currentUser.id }, function(err, d) {
    if (!d) { return next(new Error('Document not found')); } 
    res.render('documents/edit.jade', { d: d, currentUser: req.currentUser });
  });
};

exports.newDoc = function(req, res) {
  res.render('documents/new.jade', { d: new Document(), currentUser: req.currentUser });
};

exports.createDoc = function(req, res) {
  var d = new Document(req.body.document);
  d.user_id = req.currentUser.id;
  d.save(function() {
    switch (req.query.format) {
      case 'json':
        res.send(d);
       break;

       default:
        req.flash('info', 'Document created');
        res.redirect('/documents');
    }
  });
};

exports.readDoc = function(req, res, next) {
  Document.findOne({ _id: req.params.id, user_id: req.currentUser.id }, function(err, d) {
    if (!d) { return next(new Error('Document not found')); } 
    switch (req.params.format) {
      case 'json':
        res.send(d);
      break;

      case 'html':
        res.send(markdown.toHTML(d.data));
      break;

      default:
        res.render('documents/show.jade', { d: d, currentUser: req.currentUser });
    }
  });
};

exports.updateDoc = function(req, res, next) {
  Document.findOne({ _id: req.params.id, user_id: req.currentUser.id }, function(err, d) {
    if (!d) { return next(new Error('Document not found')); } 
    d.data = req.body.d.data;
    d.save(function() {
      switch (req.query.format) {
        case 'json':
          res.send(d);
         break;

         default:
          req.flash('info', 'Document updated');
          res.redirect('/documents');
      }
    });
  });
};

exports.delDoc = function(req, res, next) {
  Document.findOne({ _id: req.params.id, user_id: req.currentUser.id }, function(err, d) {
    if (!d) { return next(new Error('Document not found')); } 
    d.remove(function() {
      switch (req.params.format) {
        case 'json':
          res.send('true');
          break;

         default:
          req.flash('info', 'Document deleted');
          res.redirect('/documents');
      } 
    });
  });
};