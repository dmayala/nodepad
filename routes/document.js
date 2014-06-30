var Document = require('../models').Document();
var markdown = require('markdown').markdown;

exports.listDoc = function(req, res) {
  Document.find({user_id: req.currentUser.id}).sort({title: -1}).exec(function(err, documents) {
    switch (req.params.format) {
      case 'json':
        res.send(documents.map(function(d) {
          return d;
        }));
        break;

      default:
      documents = documents.map(function(d) {
        var clone = d.toJSON();
        clone.id = d._id;
        return clone;
      });

      res.render('documents/index', { documents: documents, currentUser: req.currentUser });
    }
  });
};

exports.listTitle = function (req, res) {
  Document.find({user_id: req.currentUser.id}).sort({title: -1}).exec(function (err, documents) {
    res.send(documents.map(function(d) {
      return { title: d.title, id: d._id };
    }));
  });
}

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
  var d = new Document(req.body);
  d.user_id = req.currentUser.id;
  d.save(function() {
    switch (req.params.format) {
      case 'json':
        var data = d.toJSON();
        data.id = data._id;
        res.send(data);
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
    
    d.title = req.body.title;
    d.data = req.body.data;

    d.save(function(err) {
      switch (req.params.format) {
        case 'json':
          res.send(d.toObject());
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

exports.search = function(req, res) {
  Document.find({user_id: req.currentUser.id, keywords: req.body.s ? req.body.s : null})
          .sort({title: -1})
          .exec(function (err, documents) {
            switch (req.params.format) {
              case 'json':
                res.send(documents.map(function (d) {
                  return { title: d.title, id: d._id };
                }));
              break;

              default:
                res.send('Format not available', 406);
              break;
            }
          });
}