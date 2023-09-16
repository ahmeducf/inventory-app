module.exports.isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
}

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || (req.user && req.user.isAdmin === false)) {
    res.redirect('/');
  } else {
    next();
  }
}
