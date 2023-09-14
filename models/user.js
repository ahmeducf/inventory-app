const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, minlength: 3, maxlength: 100, required: true },
  password: { type: String, minlength: 3, maxlength: 1000, required: true },
  email: { type: String, minlength: 3, maxlength: 1000, required: true },
  isAdmin: { type: Boolean, default: false },
  name: {
    firstName: { type: String, minlength: 3, maxlength: 100, required: true },
    familyName: { type: String, minlength: 3, maxlength: 100, required: true },
  },
});

UserSchema.virtual('url').get(function url() {
  return `/user/${this._id}`;
});

UserSchema.virtual('fullName').get(function fullName() {
  return `${this.name.firstName} ${this.name.familyName}`;
});

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
