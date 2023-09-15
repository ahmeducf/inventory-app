const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 100, required: true },
  description: { type: String, minlength: 3, maxlength: 1000, required: true },
});

CategorySchema.virtual('url').get(function url() {
  return `/categories/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
