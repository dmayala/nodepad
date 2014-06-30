var models = require('../models.js');
var User = models.User();
var LoginToken = models.LoginToken();

exports.newSes =function(req, res) {
  res.render('sessions/new', { user: new User() });
};

exports.createSes = function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;

      //Remember me
      if (req.body.remember_me) {
        var loginToken = new LoginToken({email: user.email});
        loginToken.save(function() {
          //set loginToken to the cookie and expiration date
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          res.redirect('/documents');
        });
      } else {
        res.redirect('/documents');
      }
    } else {
      req.flash('error', 'Incorrect credentials');
      res.redirect('/sessions/new');
    }
  }); 
};

exports.delSes = function(req, res) {
  if (req.session) {
    LoginToken.remove({email: req.currentUser.email}, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
};