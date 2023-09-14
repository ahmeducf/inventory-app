const LocalStrategy = require('passport-local');

const User = require('../models/user');

const verifier = async (username, password, done) => {
  const user = await User.findOne({ username });

  if (!user) {
    return done(null, false, {
      message: 'username',
    });
  }

  const valid = await user.verifyPassword(password);

  if (!valid) {
    return done(null, false, {
      message: 'password',
    });
  }

  return done(null, user);
};

module.exports.localStrategy = new LocalStrategy(verifier);

module.exports.serializer = (user, done) => {
  done(null, user.id);
};

module.exports.deserializer = async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
};
