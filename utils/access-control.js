function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('failure', 'Please log in');
        res.redirect('/');
    }
}

module.exports = {ensureAuthenticated};
