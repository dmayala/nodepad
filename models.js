var mongoose = require('mongoose');
var crypto = require('crypto');

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

//Models 
var Document = mongoose.model('Document', DocumentSchema);

//Schemas
function validatePresenceOf(value) {
  return value && value.length;
}
  
var UserSchema = new mongoose.Schema({
  'email': { type: String, index: true },
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

exports.Document = function() {
  return Document;
};

exports.User = function() {
  return User;
};