var User = require('../models.js').User();

exports.newUser = function(req, res) {
  res.render('users/new.jade', {user: new User() });
};

exports.createUser = function(req, res) {
  var user = new User(req.body.user);

  function userSaved() {
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
    // TODO: Show error messages
    res.render('users/new.jade', { user: user });
  }

  user.save(userSaved, userSaveFailed);
};
