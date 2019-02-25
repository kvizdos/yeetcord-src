var express = require('express');
var router = express.Router();

var mongo = require('../util/mongo');
var security = require('../util/security');

router.post('/users/create', function(req, res) {
    var username = req.body['username'];
    var password = req.body['password'];

    if(password == undefined) {
        res.send(JSON.stringify({status: "fail", error: "invalidParams"}))
    } else {
        var salt = security.salt(32);
        password = security.encrypt(salt + password);

        var ue = mongo.userExists(username, password, false, salt).then((response) => {
            if(response['status'] == "user created") {
                res.send(JSON.stringify({status: "complete", token: response['token'], servers: response['servers'], uid: response['uid'], code: response['code']}));
            } else {
                res.end(JSON.stringify({status: "fail", error: "alreadyexists"}))
            }
        });
    }
});

router.post('/users/login', function(req, res) {
    var username = req.body['username'];
    var password = req.body['password'];

    var ue = mongo.userExists(username, password, true).then((response) => {
        if(response['status'] == 'logged in') {
            if(response['verified'] !== true) {
                res.send(JSON.stringify({status: "complete", token: response['token'], servers: response['servers'], uid: response['uid'], code: response['code']}));
            } else {
                res.send(JSON.stringify({status: "complete", token: response['token'], servers: response['servers'], uid: response['uid'], userString: response['us'], verified: true}));

            }
        } else {
            res.send(JSON.stringify(response));
        }
    })
})

module.exports = [
    router
];