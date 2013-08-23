var User = require('../models.js').User();

exports.newSes =function(req, res) {
  res.render('sessions/new.jade', { user: new User() });
};

exports.createSes = function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;
      res.redirect('/documents');
    } else {
      // TODO: Show error
      res.redirect('/sessions/new');
    }
  }); 
};

exports.delSes = function(req, res) {
  if (req.session) {
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
};