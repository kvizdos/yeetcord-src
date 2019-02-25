var mongo = require('../util/mongo');

function isAuthenticated(req, res, next) {
    var username = req.cookies['username'];
    var token = req.cookies['token'];

    mongo.confirmToken(username, token, true).then((resp) => {
        if(resp !== false) {
            console.log(resp);
            if(resp['verified'] == true) {
                return next();
            } else {
                res.redirect('/verify')
            }
        } else {
            res.redirect('/login');
        }
        
    })
}

module.exports = { isAuthenticated }