var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const Security = require('./security');

var loggerCount = 0;
var LogHandler = function() {
    this.log = function(msg) {
        console.log(msg);
    },
    this.update = function(msg) {
        console.log('\033[36m' +  msg + "\x1b[0m");
    },
    this.success = function(msg) {
        console.log("\x1b[32m" +  msg + "\x1b[0m");
    },
    this.warn = function(msg) {
        console.log("\x1b[33m" + msg + "\x1b[0m");
    },
    this.danger = function(msg) {
        console.log("\x1b[31m" + msg + "\x1b[0m");
    },
    loggerCount++;
    this.update("Logger ("+loggerCount+") Initialized")
}

var _Logger = new LogHandler();

// Server Handler
var ServerHandler = function() {
    this.db,
    _Logger.update("Initializing Server Handler"),

    this.registerMongoConnection = function() {
        return MongoClient.connect(url, { useNewUrlParser: true });
    },
    this.createServer = async function(owner, id, ez = null) {
        return new Promise((resolve, reject) => {
            this.doesExist(id).then((resp) => {
                if(resp['id'] == false) {
                    ez = ez !== null ? ez : Security.salt(6);
                    this.doesExist(ez, true).then(ezExists => {
                        if(ezExists['id'] == false) {
                            this.registerMongoConnection().then(db => {
                                var dbo = db.db("linkr");

                                dbo.collection("servers").insertOne({id: id, ez: ez, owner: owner, users: [], admins: []}, (err, res) => {
                                    if(err) {

                                        _Logger.danger(err);
                                        resolve({status: "fail", error: "database"});
                                    }

                                    resolve({status: "complete", ez: ez});
                                })
                            });
                        } else {
                            resolve({status: "fail", error: "ez exists"});
                        }
                    });
                } else {
                    resolve({status: "fail", error: "server already exists"});
                }

            })
        })
    },
    this.leaveServer = async function(id) {
        return new Promise((resolve, reject) => {
            this.doesExist(id).then((resp) => {
                if(resp['id'] !== false) {
                    this.registerMongoConnection().then(db => {
                        var dbo = db.db("linkr");

                        dbo.collection("servers").removeOne({id: id}, (err, res) => {
                            if(err) {
                                _Logger.danger(err);
                                resolve({status: "fail", error: "database"});
                            }

                            resolve({status: "complete"});
                        })
                    });
                } else {
                    resolve({status: "fail", error: "server does not exist"});
                }
            })
        })
    },
    this.doesExist = async function(id, ez = false) {
        return new Promise((resolve, reject) => { 
            var findScheme = ez ? {ez: id} : {id: id};
            this.registerMongoConnection().then(db => {
                var dbo = db.db("linkr");
                dbo.collection("servers").findOne(findScheme, function(err, result) {
                    if(err) {
                        _Logger.danger(err);
                        reject("DB Issue!");
                    }
                    resolve(result !== null ? {id: result['id']} : {id: false});
                    db.close();
                });
            })
        })
    },
    this.join = async function(id, username) {
        return new Promise((resolve, reject) => {
            this.registerMongoConnection().then(db => {
                var dbo = db.db("linkr");

                dbo.collection("users").findOne({username: username}, (err, result) => {
                    if(err) throw err;
                    if(result !== null) {
                        dbo.collection("users").findOne({username: username, servers: { $in: [id] }}, (err, res) => {
                            if(res == null) {
                                this.doesExist(id, true).then((exists) => {
                                    if(exists['id'] !== false) {
                                        dbo.collection("servers").updateOne({ez: id}, { $push: { users: username } }, function(err, r) {
                                            dbo.collection("users").updateOne({username: username}, { $push: { servers: id } }, (err, r) => {
                                                dbo.collection("users").updateOne({username: username}, { $push: { serverIds: exists['id'] } }, (err, r) => {
                                                    resolve({status: "complete"});
                                                });
                                            });
                                        });
                                    } else {
                                        resolve({status: "fail", error: "invalid id"});
        
                                    }
                                })
                            } else {
                                resolve({status: "fail", error: "user already in guild"});
                            }
                        })
                    } else {
                        resolve({status: "fail", error: "user does not exist"});
                    }
                });
            })
        });
    },
    this.getServers = async function(username) {
        return new Promise((resolve, reject) => {
            this.registerMongoConnection().then(db => {
                var dbo = db.db("linkr");

                dbo.collection("users").findOne({username: username}, (err, result) => {
                    if(err) {
                        _Logger.danger("We've run into an issue");
                        console.error(err);
                        resolve({status: "fail", error: "database"});
                    }
                    var servers = result['serverIds'];
                    var users = [];

                    resolve({servers: result['serverIds']});
                })
            })
        });
    },
    this.getUsersInServer = async function(ez) {
        return new Promise((resolve, reject) => {
            this.registerMongoConnection().then(db => {
                var dbo = db.db("linkr");

                dbo.collection("servers").findOne({ez: ez}, (err, result) => {
                    resolve(result['users']);
                })
            })
        });
    }
}

var RichTextHandler = function() {
    _Logger.update("Initializing Rich Text Handler");
}

module.exports = { ServerHandler, LogHandler }