const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');

const UserSchema = new mongoose.Schema({
  username: { type: String, minlength: 3, maxlength: 100, required: true },
  password: { type: String, minlength: 3, maxlength: 1000, required: true },
  email: { type: String, minlength: 3, maxlength: 1000, required: true },
  isAdmin: { type: Boolean, default: false },
  name: {
    firstName: { type: String, minlength: 3, maxlength: 100, required: true },
    familyName: { type: String, minlength: 3, maxlength: 100, required: true },
  },
  createdAt: { type: Date, default: () => Date.now() },
});

UserSchema.virtual('url').get(function url() {
  return `/users/${this._id}`;
});

UserSchema.virtual('fullName').get(function fullName() {
  return `${this.name.firstName} ${this.name.familyName}`;
});

UserSchema.virtual('createdAtFormatted').get(function createdAtFormatted() {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
