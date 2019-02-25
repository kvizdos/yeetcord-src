var mongo = require('../util/mongo');

function isAuthenticated(req, res, next) {
    var username = req.cookies['username'];
    var token = req.cookies['token'];

    mongo.confirmToken(username, token).then((resp) => {
        if(resp) {
            return next();
        } else {
            res.redirect('/login');
        }
    })
}

module.exports = { isAuthenticated }