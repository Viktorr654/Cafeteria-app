function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'You must be logged in' });
}

function isStaff(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'staff') {
    return next();
  }
  return res.status(403).json({ message: 'Staff only' });
}

module.exports = { isLoggedIn, isStaff };