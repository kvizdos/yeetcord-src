var crypto = require('crypto');

function encrypt(text) {
    return crypto.createHash('sha256').update(text).digest('base64');
}

function salt(len = 16) {
    var possibilites = "abcdefghijklmnopqrstuvwxyz1234567890";
    possibilites = possibilites.split("");
    var token = "";

    for(var i = 0; i < len; i++) {
        token += possibilites[Math.floor(Math.random()*(possibilites.length - 1))]
    }

    return token;
}


module.exports = { encrypt, salt };