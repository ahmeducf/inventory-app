module.exports.isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  } else {
    next();
  }
}

module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.isAdmin === false) {
    console.log(req.user.isAdmin);
    res.redirect('/');
  } else {
    next();
  }
}
