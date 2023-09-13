const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const ItemSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, maxlength: 100, required: true },
  description: { type: String, minlength: 3, maxlength: 1000, required: true },
  price: { type: Number, min: 0, required: true },
  image: { type: String, unique: true, required: true },
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => Date.now() },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

ItemSchema.virtual('url').get(function url() {
  return `/item/${this._id}`;
});

ItemSchema.virtual('priceFormatted').get(function priceFormatted() {
  return `$${this.price.toFixed(2)}`;
});

ItemSchema.virtual('createdAtFormatted').get(function createdAtFormatted() {
  return DateTime.fromJSDate(this.created).toLocaleString(DateTime.DATE_MED);
});

ItemSchema.virtual('imageSrc').get(function imageSrc() {
  return `/images/${this.image}`;
});

module.exports = mongoose.model('Item', ItemSchema);
