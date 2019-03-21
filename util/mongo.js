var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var security = require('./security');

var tokenCache = [];

var defaultServer = "tsqjaq";

var Token = function(user, token) {
    this.token = token,
    this.user = user,
    this.setToken = function(token) {
        this.token = token
    }
}

// MONGO CALLS

/* 
CALLED FROM:
- /users/create
- /users/login
DESC: this function covers logging in, registering, or checking if a user is created.
FUNCTIONS:
- userExists(username) == check if user exists
- userExists(username, password, false, salt) == create a user
- userExists(username, password, true) == login a user
*/
async function userExists(user, password = undefined, login = false, salt = undefined) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("linkr");
                // Just check if username is taken
                dbo.collection("users").findOne({username: user}, function(err, result) {
                    if (err) throw err;
                    if(result !== null) {
                        if(login) {
                            password = security.encrypt(result['salt'] + password);
                            if(result['password'] == password) {
                                updateToken(user).then((res) => {
                                    if(result['verified'] == undefined) {
                                        dbo.collection('codes').findOne({uid: result['uid']}, function(err, r) {
                                            resolve({status: "logged in", token: res, servers: result['servers'], uid: result['uid'], code: r['code']});
                                        })
                                    } else {
                                        resolve({status: "logged in", token: res, servers: result['servers'], uid: result['uid'], verified: true, us: result['userString']});
                                    }
                                });
                            } else {
                                resolve({status: "incorrect password"})
                            }
                        } else {
                            resolve({status: "user exists"});
                        }
                    } else {    
                        if(password !== undefined && !login) {
                            if(user.indexOf('>') == -1  && 
                               user.indexOf('<') == -1  && 
                               user.indexOf('&') == -1  && 
                               user.indexOf('\'') == -1 && 
                               user.indexOf('\"') == -1 && 
                               user.indexOf('&') == -1 && 
                               user.indexOf('|') == -1) {
                                var token = security.salt(64);
                                var uid = security.salt(8);
                                dbo.collection("users").insertOne({uid: uid, username: user, password: password, salt: salt, token: token, servers: ["yeet"]}, function(err, res) {
                                    if (err) throw err;
                                    var code = security.salt(6);
                                    dbo.collection('codes').insertOne({uid: uid, code: code}, function(err, resp) {
                                        if(err) throw err;

                                        console.log("Created User!");
    
                                        var newToken = new Token(user, token);
                                        tokenCache.push(newToken);

                                        resolve({status: "user created", token: token, servers: ['yeet'], serverIds: ["549317482226253836"], uid: uid, code: code});
                                        db.close();

                                    });
                                });
                            } else {
                                resolve({status: "fail", error: "xss"});
                            }
                        } else {
                            resolve({status: "user does not exist"});
                        }
                    }
                });
        });
    });
}

// Update User Token
async function updateToken(user) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("linkr");
            var token = security.salt(64);
                dbo.collection("users").updateOne({username: user}, { $set: { token: token} }, function(err, result) {
                    var newToken = new Token(user, token);

                    if(tokenCache.length !== 0) {
                        var newTokenCache = tokenCache.filter((t) => {
                            return t.user !== user;
                        });
                        newTokenCache.push(newToken);
                        tokenCache = newTokenCache;
                    } else {
                        tokenCache.push(newToken);
                    }

                    resolve(token);
                    db.close();
                });
        });
    });
}

// Confirm token
async function confirmToken(user, token, disableCache = false) {
    return new Promise((resolve, reject) => {
        // check token cache
        var tokenExists = tokenCache.filter((t) => {
            if(t.user == user && t.token == token) {
                return t;
            }
        }).length == 1;

        if(tokenExists && !disableCache) {
            resolve(true);
        } else {
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("linkr");
                    dbo.collection("users").findOne({username: user, token: token}, function(err, result) {
                        if(result !== null) {
                            var newToken = new Token(user, token);
                            tokenCache.push(newToken);
                            resolve({verified: result['verified']});
                        } else {
                            resolve(false);
                        }
                        db.close();
                    });
            });
        }
    });
}

// Add server to user
async function joinServer(user, id) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("linkr");
            dbo.collection("users").findOne({username: user, servers: id}, function(err, result) {
                if(result == null) {
                    dbo.collection("users").updateOne({username: user}, { $push: {servers: id} }, function(err, result) {
                        resolve(true);
                    });
                } else {
                    resolve(false)
                }
                db.close();
            });
        });
    })
}

// Verify user
async function verifyUser(uid, code, us, username) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("linkr");
            console.log(code);
            console.log(uid);
            console.log(us);
            dbo.collection("codes").findOne({code: code}, function(err, result) {
                if(result !== null) {
                    dbo.collection("users").updateOne({uid: uid}, { $set: {verified: true, userString: us } }, function(err, result) {
                        dbo.collection("codes").deleteOne({uid: uid, code: code}, function(err, r) {
                            if(err) throw err;
                            updateToken(username).then((resp) => {
                                resolve(true);
                            })
                            db.close();

                        });
                    });
                } else {
                    resolve(false)
                }
            });
        });
    });
}

module.exports = { userExists, updateToken, confirmToken, joinServer, verifyUser }