var express = require('express');
var router = express.Router();

var mongo = require('../util/mongo');
var security = require('../util/security');

var handlers = require('../util/handlers');
var _Logger = new handlers.LogHandler();

var path = require('path');
var mw = require('../routes/middleware');


_Logger.success("Starting Game Handler..");

var games = [];

var CurrentPlayers = [];
var CurrentGames = [];

router.use('/games/assets', express.static(path.join(__dirname, 'games/assets')))

var StateManager = function() {
    this.state,
    this.allPlayers = [],
    this.allGames = [],
    this.allGameIds = [],
    this.addPlayer = function(player) {
        this.allPlayers.push(player);
    },
    this.removePlayer = function(socketId) {
        this.allPlayers = this.allPlayers.filter((p) => {
            return p.id !== socketId
        });
    },
    this.getPlayers = function(player, gameId = "", socketId = "") {
        if(gameId !== "") {
            return this.allPlayers.filter((p) => {
                return p.gameId == gameId
            })
        }
        if(socketId !== "") {
            return this.allPlayers.filter((p) => {
                return p.id == socketId
            })
        }
        return this.allPlayers.filter((p) => {
            return p.gameId = player.gameId
        })
    },
    this.addGame = (game) => {
        this.allGames.push(game);
        this.allGameIds.push(game.id);
    },
    this.getGameId = function(name) {
        return this.allGames.filter((g) => {
            return g.name == name;
        })[0]['id']
    },
    this.getGameById = (id) => {
        return this.allGames.filter((g) => {
            return g.id == id;
        })[0];
    },
    this.getAllUsers = () => {
        return this.allPlayers.filter((u) => {
            return u.isDead == false;
        });
    },
    this.getAllGameIds = () => {
        return this.allGameIds;
    },
    this.getLeaderboard = (id) => {
        var lb = this.allPlayers.filter((u) => {
            return u.gameId == id;
        })

        var sortable = [];
        for(var player in lb) {
            sortable.push([lb[player].username, Math.floor(lb[player].size)]);
        }

        sortable.sort((a,b) => {
            return a[1] - b[1];
        })

        return sortable.splice(0, 3).reverse();
    }
}

var _SM = new StateManager();

var Game = function(name, description, height, width, cb) {
    this.name = name,
    this.description = description,
    this.id = security.salt(8),
    this.GameBoard = {
        height: height,
        width: width
    },
    this.gameObjects = [],
    _Logger.gameUpdate("Bubblio: game registered");
    router.get('/games/' + this.name.toLowerCase(), mw.isAuthenticated, (req, res) => {
        res.sendFile(path.join(__dirname, '../games/games/' + this.name.toLowerCase(), 'index.html'));
    }),
    router.use('/games/' + this.name.toLowerCase() + "/assets/", express.static(path.join(__dirname, 'games/'+this.name.toLowerCase()+'/assets')))
    _Logger.update("* New Game Registered: " + this.name)
    _SM.addGame(this);
    cb()
}


var Player = function(socketId, gameId, username = "Test User") { 
    this.id = socketId,
    this.gameId = gameId,
    this.username = username,
    this.size = 25,
    this.speed = 5,
    this.isDead = false,
    this.color = '#'+Math.floor(Math.random()*16777215).toString(16),
    this.position = {
        dirs: {
            last: '',
            left: false,
            right: false,
            up: false,
            down: false
        },
        x: Math.floor(Math.random() * _SM.getGameById(this.gameId).GameBoard.width - 50) + 50,
        y: Math.floor(Math.random() * _SM.getGameById(this.gameId).GameBoard.height - 50) + 50
    },
    this.respawn = (username) => {
        this.username = username;
        this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
        this.position.x = Math.floor(Math.random() * _SM.getGameById(this.gameId).GameBoard.width - 50) + 50;
        this.position.y = Math.floor(Math.random() * _SM.getGameById(this.gameId).GameBoard.height - 50) + 50;
        this.isDead = false;
        this.size = 25;
        this.speed = 5;
    },
    this.pressDirection = (dir) => {
        switch(dir) {
            case "left":
                this.position.dirs.left = true;
                break;
            case "right":
                this.position.dirs.right = true;
                break;
            case "up":
                this.position.dirs.up = true;
                break;
            case "down":
                this.position.dirs.down = true;
                break;
        }
    },
    this.releaseDirection = (dir) => {
        this.position.dirs.last = dir;
        switch(dir) {
            case "left":
                this.position.dirs.left = false;
                break;
            case "right":
                this.position.dirs.right = false;
                break;
            case "up":
                this.position.dirs.up = false;
                break;
            case "down":
                this.position.dirs.down = false;
                break;
        }
    }
    this.updatePos = () => {
       if(this.position.dirs.left) this.position.x -= this.speed;
       if(this.position.dirs.right) this.position.x += this.speed;
       if(this.position.dirs.up) this.position.y -= this.speed;
       if(this.position.dirs.down) this.position.y += this.speed;

       if(!this.position.dirs.left && !this.position.dirs.right && !this.position.dirs.up && !this.position.dirs.down) {
            switch(this.position.dirs.last) {
                case "left":
                    this.position.x -= this.speed;
                    break;
                case "right":
                    this.position.x += this.speed;
                    break;
                case "up":
                    this.position.y -= this.speed;
                    break;
                case "down":
                    this.position.y += this.speed;
                    break;
            }
       }


        if(this.position.x <= 0 || this.position.x >= _SM.getGameById(this.gameId).GameBoard.width || this.position.y <= 0 || this.position.y >= _SM.getGameById(this.gameId).GameBoard.height) {
            this.isDead = true;
        }; 
    }
}

// REGISTER ALL GAMES HERE
var Bubblio = new Game("Bubblio", "yee", 5000, 5000, () => {});

var SocketHandler = function(io) {
    io.on('connection', (socket) => {
        socket.on('join game', (game, nickname, fn) => {
            var newPlayer = new Player(socket.id, _SM.getGameId(game), nickname);
            socket.join(newPlayer.gameId);

            _SM.addPlayer(newPlayer);

            fn(newPlayer.id);
        });

        
        socket.on('disconnect', () => {
            _SM.removePlayer(socket.id);
        });

        socket.on('pressing direction', (direction) => { 
            if(_SM.getPlayers("", "", socket.id)[0] !== undefined) {
                _SM.getPlayers("", "", socket.id)[0].pressDirection(direction);
            }           
        })

        socket.on('releasing direction', (direction) => { 
            if(_SM.getPlayers("", "", socket.id)[0] !== undefined) {
                _SM.getPlayers("", "", socket.id)[0].releaseDirection(direction);
            }           
        });

        socket.on('respawn', (username) => {
            _SM.getPlayers("", "", socket.id)[0].respawn(username);
        })
    });

    setInterval(function() {
        var players = _SM.getAllUsers();
        var checkCollisions = players;

        for(player in players) {
            players[player].updatePos();
        }

        var gameIds = _SM.getAllGameIds();
        for(id in gameIds) {
            var game = _SM.getGameById(gameIds[id]);
            var objects = game.gameObjects;
            var width = game.GameBoard.width;
            var height = game.GameBoard.height;


            if(objects.length < 100) {
                do {
                    objects.push({x: Math.floor(Math.random() * width - 50) + 50, y: Math.floor(Math.random() * height - 50) + 50, size: Math.floor(Math.random() * (75 - 8 + 1)) + 8, color: '#'+Math.floor(Math.random()*16777215).toString(16)});
                } while (objects.length <= 100);
            } else if(checkCollisions.length > 0 && players.length > 0) {
                while (checkCollisions.length > 0) {
                    for(var i = 0; i < objects.length; i++) {
                        if(objects[i].x >= (checkCollisions[checkCollisions.length - 1].position.x - (checkCollisions[checkCollisions.length - 1].size / 2)) && objects[i].x <= (checkCollisions[checkCollisions.length - 1].position.x + (checkCollisions[checkCollisions.length - 1].size / 2))
                        && objects[i].y >= (checkCollisions[checkCollisions.length - 1].position.y - (checkCollisions[checkCollisions.length - 1].size / 2)) && objects[i].y <= (checkCollisions[checkCollisions.length - 1].position.y + (checkCollisions[checkCollisions.length - 1].size / 2))  
                        && objects[i].size <= checkCollisions[checkCollisions.length - 1].size) {
                            players[player].size += (Math.random() * (.15 - .1)) + 0.1 * objects[i].size;
                            var removing = (players[player].size / (1000 - objects[i].size / 4));
                            var newSpeed = players[player].speed - removing;
                            if(newSpeed < 1.0) {
                                newSpeed = 1.0;
                            }
                            players[player].speed = newSpeed;
                            game.gameObjects.splice(i, 1);
                        }
                    }

                    for(var i = 0; i < players.length; i++) {
                        if(players[i].position.x >= (checkCollisions[checkCollisions.length - 1].position.x - (checkCollisions[checkCollisions.length - 1].size / 2)) && players[i].position.x <= (checkCollisions[checkCollisions.length - 1].position.x + (checkCollisions[checkCollisions.length - 1].size / 2))
                        && players[i].position.y >= (checkCollisions[checkCollisions.length - 1].position.y - (checkCollisions[checkCollisions.length - 1].size / 2)) && players[i].position.y <= (checkCollisions[checkCollisions.length - 1].position.y + (checkCollisions[checkCollisions.length - 1].size / 2))  
                        && players[i].size <= checkCollisions[checkCollisions.length - 1].size
                        && players[i].id !== checkCollisions[checkCollisions.length - 1].id) {
                            players[player].size += (Math.random() * (.15 - .1)) + 0.1 * players[i].size;
                            var removing = (players[player].size / (1000 - players[i].size / 4));
                            var newSpeed = players[player].speed - removing;
                            if(newSpeed < 1.0) {
                                newSpeed = 1.0;
                            }
                            players[player].speed = newSpeed;

                            players[i].isDead = true;
                        }
                    }

                    checkCollisions.shift();
                }
            }


            io.to(gameIds[id]).emit('game tick', _SM.getPlayers("", gameIds[id]), objects, _SM.getLeaderboard(gameIds[id]));
        }
    }, 24)
}

module.exports = {
    router,
    Player,
    SocketHandler
};