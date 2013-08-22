var mongoose = require('mongoose');

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

exports.Document = function() {
  return Document;
};