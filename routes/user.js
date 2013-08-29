var User = require('../models').User();
var emails = require('../email').emails;

exports.newUser = function(req, res) {
  res.render('users/new.jade', {user: new User() });
};

exports.createUser = function(req, res) {
  var user = new User(req.body.user);

  function userSaved() {
    req.flash('info', 'Your account has been created');
    emails.sendWelcome(user);
    switch (req.params.format) {
      case 'json':
        res.send(user);
      break;

      default:
        req.session.user_id = user.id;
        res.redirect('/documents');
    }
  }

  function userSaveFailed() {
    req.flash('error', 'Account creation failed');
    res.render('users/new.jade', { user: user });
  }

  user.save(userSaved, userSaveFailed);
};
