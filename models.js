var mongoose = require('mongoose');
var crypto = require('crypto');

function extractKeywords(text) {
  if (!text) return [];

  return text.
    split(/\s+/).
    filter(function(v) { return v.length > 2; }).
    filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

//Schemas
var DocumentSchema = new mongoose.Schema({
  'title': { type: String, index: true },
  'data': String,
  'tags': [String],
  'keywords': [String],
  'user_id': mongoose.Schema.ObjectId
});

DocumentSchema.virtual('id')
  .get(function() {
    return this._id.toHexString();
});

DocumentSchema.pre('save', function(next) {
  this.keywords = extractKeywords(this.data);
  next();
});

//Models 
var Document = mongoose.model('Document', DocumentSchema);

//Schemas
function validatePresenceOf(value) {
  return value && value.length;
}
  
var UserSchema = new mongoose.Schema({
  'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  'hashed_password': String,
  'salt': String
});

UserSchema.virtual('id')
  .get(function() {
    return this._id.toHexString();
});

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  }).get(function() { return this._password; });

UserSchema.method('authenticate', function(plainText) {
  return this.encryptPassword(plainText) === this.hashed_password;
});
  
UserSchema.method('makeSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

UserSchema.method('encryptPassword', function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

UserSchema.pre('save', function(next) {
  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});


//Models 
var User = mongoose.model('User', UserSchema);

//Schemas
LoginToken = new mongoose.Schema({
    email: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
  });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ email: this.email, token: this.token, series: this.series });
  });

//Models
var LoginToken = mongoose.model('LoginToken', LoginToken);

exports.Document = function() {
  return Document;
};

exports.User = function() {
  return User;
};

exports.LoginToken = function() {
  return LoginToken;
};