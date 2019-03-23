const express = require('express')
const app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var path = require('path');

const Discord = require('discord.js');
const client = new Discord.Client();

var mw = require('./routes/middleware');

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var mongo = require('./util/mongo');
var handler = require('./util/handlers');

var fs = require('fs');

var _ServerHandler = new handler.ServerHandler(); 
var _Logger = new handler.LogHandler();

var activeChannels = [];

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

http.listen(3000, function(){
    _Logger.success('listening on *:3000');
});

app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.get('/', mw.isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'login.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'verify.html'));
});

app.post('/join', mw.isAuthenticated, function(req, res) {
    var username = req.body['username'];
    var id = req.body['id'];
    
    _ServerHandler.join(id, username).then((resp) => {
        if(resp['error'] == undefined) {
            res.end(JSON.stringify(resp));
        } else {
            res.end(JSON.stringify(resp));
        }
    });

});


app.use(require('./routes/user'))

function generateVerification(len = 8) {
    var possibilites = "abcdefghijklmnopqrstuvwxyz1234567890";
    possibilites = possibilites.split("");
    var token = "";

    for(var i = 0; i < len; i++) {
        token += possibilites[Math.floor(Math.random()*(possibilites.length - 1))]
    }

    return token;
}


var tempUsers = [];
// SOCKET SHIT
var Guild = function(id, name, channels, users) {
    this.id = id,
    this.name = name,
    this.channels = channels,
    this.users = users
}


function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

 // Displayname cache
 var dnCache = [];
var onlineUsers = [];
io.on('connection', function(socket){
    tempUsers.push(socket.id);
    _Logger.warn('New User Connected (#'+tempUsers.length+')');    

    socket.on('go online', function(username, guild) {
        io.to(guild).emit('new user', username, guild)

    })
    
    socket.on('disconnect', function(){
        io.emit("user offline", )
        activeChannels.splice(tempUsers.indexOf(socket.id), 1);
        tempUsers.splice(tempUsers.indexOf(socket.id), 1);
    });

    socket.on('update servers', function(username, fn) {
        var guilds = [];
        var messages = [];
        _ServerHandler.getServers(username).then((info) => {
            var users = info['users'];
            var servers = info['servers'];
            for(var i = 0; i < servers.length; i++) {
                socket.join(servers[i]);
                var channels = [];
                client.guilds.get(servers[i])['channels'].forEach((c) => {
                    if(c['type'] == 'text') {
                        channels.push({id: c['id'], name: c['name']})
                    }
                })

                var newGuild = new Guild(client.guilds.get(servers[i])['id'], client.guilds.get(servers[i])['name'], channels, users);
                guilds.push(newGuild);

            }
    
            fn(guilds);
        })
    });

    socket.on('request history', function(info, fn) {
        client.guilds.get(info['guild']).channels.get(info['channel']).fetchMessages({limit: 100}).then(msgs => {
            var fancyMessages = msgs.map((m) => {
                var atts = [];
                if (m.attachments.size > 0) {
                    m.attachments.every((i) => {
                        atts.push(i.url);
                    });
                }
                return {author: m['author']['username'], content: m['content'], timestamp: m['createdTimestamp'], channel: info['channel'], us: m['author']['id'], attachments: atts };
            })
            
            fn(fancyMessages);
        })
    })


    socket.on('send message', function(msgContent) {
        msgContent = JSON.parse(msgContent);
        if(msgContent['message'] !== '') {
            mongo.confirmToken(msgContent['user'], msgContent['token']).then((resp) => {
                if(resp) {
                    var cached = dnCache.filter((c) => {
                        return c.us == msgContent['us'] && c.guild == msgContent['guild'];
                    })
                    if(cached.length !== 0) {
                        var username = cached[0].name;
                                                    
                        client.guilds.get(msgContent['guild']).channels.get(msgContent['channel']).send("*" + username + "* >> " + msgContent['message']);
    
                        msgContent['message'] = escapeHtml(msgContent['message']);

                        dnCache.push({us: msgContent['us'], guild: msgContent['guild'], name: username});

                        msgContent['user'] = username;

                        io.to(msgContent['guild']).emit('receive message', JSON.stringify(msgContent));    
                    } else {
                        var uInfo = client.guilds.get(msgContent['guild']).fetchMember(msgContent['us'].substr(2, msgContent['us'].length - 3));
                        uInfo.then((r) => {
                        
                            var username = r.nickname !== null ? r.nickname : r.displayName;
                                                    
                            client.guilds.get(msgContent['guild']).channels.get(msgContent['channel']).send("*" + username + "* >> " + msgContent['message']);
        
                            msgContent['message'] = escapeHtml(msgContent['message']);

                            dnCache.push({us: msgContent['us'], guild: msgContent['guild'], name: username});

                            msgContent['user'] = username;

                            io.to(msgContent['guild']).emit('receive message', JSON.stringify(msgContent));


                        })
                    }
                } else {
                    socket.emit('mismatch');
                }
            })
        }
            
    });

});

// CONSTRUCTOR SHIT
function Message(user, message, timestamp, isVerified = false, guild, channel, id = generateVerification(8), attachments = {}) {
    this.id = id;
    this.user = user,
    this.message = message,
    this.timestamp = timestamp,
    this.edited = false,
    this.isVerified = isVerified,
    this.channel = channel,
    this.guild = guild,
    this.attachments = attachments,
    this.getGuild = function() {
        return this.guild
    },
    this.delete = function() {
        messages = messages.filter((m) => {
            return (m.id !== this.id);
        })
    },
    this.edit = function(message) {
        this.message = message;
        this.edited = true;
    },
    this.toString = function() { 
        return `<div id="msg">\
                    <p id="msgUsername"><span class='verified'>V</span> ${this.user}</p>\
                    <p id="msgBody">${this.message}</p>\
                    <p id="msgFooter">${this.timestamp}</p>\
                </div>`
    }  
}

// DISCORDJS SHIT
var discordConf = require('./discord/config');

client.on("ready", () => {
    _Logger.success(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});
  
client.on("guildCreate", guild => {
    
    _ServerHandler.createServer("Someone", guild.id).then(resp => {
        if(resp['status'] == "complete") {
           
            var genChat = client.guilds.get(guild.id)['channels'].filter((c) => {
                return c.name == "general" && c.type == "text";
            }).map((o) => {
                return o.id
            })
            var ez = resp['ez'];
            client.guilds.get(guild.id).channels.get(genChat[0]).send("Hello! I'm now activated, wahoo! To join this channel on Yeetcord, either enter the code: '"+ez+"' into the join area, or go to https://yeetcord.tk/join/" + ez + "! It is recommended to either pin this message or put it in somewhere easy to find, but you can always run `!yeetcord id` to get it back :D Enjoy!")

        } else {

        }
    })
    
    _Logger.success(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});
  
client.on("guildDelete", guild => {
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
    _ServerHandler.leaveServer(guild.id).then(resp => {
        if(resp['status'] == "complete") {
            _Logger.danger(`I have been removed from: ${guild.name} (id: ${guild.id})`);
        } else {
            _Logger.danger("FAILED TO REMOVE GUILD: " + guild.id);
        }
    }) 

});


client.on('message', async message => {
    if(message.author.bot) return;
    var prefix = discordConf.prefix;

    var commandStr = message.content.split(" ");

    if(commandStr[0] == prefix) {
        _ServerHandler.doesExist(message.guild.id).then((resp) => {
            var server = resp['id'];
            if(commandStr.length == 1) {
                message.reply("Hello! The ID of this server is: `" + server[0]['ez'] + "`\nTo verify your account, please type: `!yeetcord verify <uid/tag> <verification code> <username>`\nCan't find the code? If it's not above the 'Logout' button on Yeetcord, you're already verified!")
            } else {
                switch(commandStr[1]) {
                    case "verify":
                        if(message.guild.id == "549317482226253836") {
                        if(commandStr[4] !== undefined) {
                                message.reply("Please hold a moment while I verify you...");
                                mongo.verifyUser(commandStr[2], commandStr[3], message.author.toString(), commandStr[4]).then((resp) => {
                                    if(resp) {
                                        message.reply("You're all set! Enjoy verification :D (Note: You will now need to relogin)");

                                        var role = message.guild.roles.find(role => role.name === "Verified User");
                                        message.member.addRole(role);

                                    } else {
                                        message.reply("Hmm, that code didn't work.")
                                    }
                                })
                            } else {
                                message.reply("Please send you're tag, verifiation code, and username along!")
                            }
                        } else {
                            message.reply("You must be in the Official Yeetcord Central Server. I've PM'd you the join code!");
                            message.author.send("Hello! To verify your account, please join this server https://discord.gg/Nd2RqCz")
                        }
                        break;
                }
            }
        })
    } else {
        var atts = [];
        if (message.attachments.size > 0) {
            message.attachments.every((i) => {
                atts.push(i.url);
            });
        }

        console.log(atts);
        var newMsg = new Message(message.author.username, message.content, message.createdTimestamp, true, message.guild.id, message.channel.id, message.id, atts);

        console.log(message.attachments.size > 0);
        newMsg.message = escapeHtml(newMsg.message);
        
        io.to(newMsg.guild).emit('receive message', JSON.stringify(newMsg));
    }
})




// AUTHORIZATION SECTION
/*
client.on('guildMemberAdd', member => {
    member.guild.channels.get('549404374426976267').send("Welcome! To verify your account, please type: `!yeetcord verify <uid/tag> <verification code> <username>`. If you don't have a Yeetcord account yet, you need one @ yeetcord.tk"); 
});
  */
client.login(discordConf.token);