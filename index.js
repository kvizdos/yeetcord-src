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

var fs = require('fs');

var activeChannels = [];

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use('/css', express.static(path.join(__dirname, 'public/css')))
app.use('/js', express.static(path.join(__dirname, 'public/js')))

app.get('/', mw.isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'login.html'));
});

app.post('/join', mw.isAuthenticated, function(req, res) {
    var username = req.body['username'];
    var id = req.body['id'];
    var activeServers = JSON.parse(fs.readFileSync('./discord/servers.json', 'utf8'));

    var server = activeServers.filter((g) => {
        return g.ez == id
    });
    if(server.length == 1) {
        mongo.joinServer(username, id).then((resp) => {
            if(resp) {
                res.end(JSON.stringify({status: "success"}));
            } else {
                res.end(JSON.stringify({status: "fail", error: "already in"}));
            }
        })
    } else {
        res.end(JSON.stringify({status: "fail", error: "invalid code"}));
    }
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
var Guild = function(id, name, channels) {
    this.id = id,
    this.name = name,
    this.channels = channels
}


function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

io.on('connection', function(socket){
    tempUsers.push(socket.id);
    console.log('New User (#'+tempUsers.length+')');    
    socket.on('disconnect', function(){
        console.log('user disconnected');
        activeChannels.splice(tempUsers.indexOf(socket.id), 1);
        tempUsers.splice(tempUsers.indexOf(socket.id), 1);
    });

    socket.on('update servers', function(servers, fn) {
        var guilds = [];
        var activeServers = JSON.parse(fs.readFileSync('./discord/servers.json', 'utf8'));

        for(var i = 0; i < servers.length; i++) {
            var server = activeServers.filter((s) => {
                return s.ez == servers[i]
            });

            socket.join(server[0]['id']);
            var channels = [];
            client.guilds.get(server[0]['id'])['channels'].forEach((c) => {
                if(c['type'] == 'text') {
                    channels.push({id: c['id'], name: c['name']})
                }
            })
            var newGuild = new Guild(client.guilds.get(server[0]['id'])['id'], client.guilds.get(server[0]['id'])['name'], channels);
            guilds.push(newGuild);
        }

        fn(guilds);
    });


    socket.on('send message', function(msgContent) {
        msgContent = JSON.parse(msgContent);
        if(msgContent['message'] !== '') {
            mongo.confirmToken(msgContent['user'], msgContent['token']).then((resp) => {
                if(resp) {
                    client.guilds.get(msgContent['guild']).channels.get(msgContent['channel']).send("*" + msgContent['us'] + "* >> " + msgContent['message']);

                    msgContent['message'] = escapeHtml(msgContent['message']);

                    io.to(msgContent['guild']).emit('receive message', JSON.stringify(msgContent));

                } else {
                    socket.emit('mismatch');
                }
            })
        }
            
    });

});

// CONSTRUCTOR SHIT
function Message(user, message, timestamp, isVerified = false, guild, channel, id = generateVerification(8)) {
    this.id = id;
    this.user = user,
    this.message = message,
    this.timestamp = timestamp,
    this.edited = false,
    this.isVerified = isVerified,
    this.channel = channel,
    this.guild = guild,
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
        if(!isVerified) {
            return `<div id="msg">\
                        <p id="msgUsername">${this.user}</p>\
                        <p id="msgBody">${this.message}</p>\
                        <p id="msgFooter">${this.timestamp}</p>\
                    </div>`
        } else {
            return `<div id="msg">\
                        <p id="msgUsername"><span class='verified'>V</span> ${this.user}</p>\
                        <p id="msgBody">${this.message}</p>\
                        <p id="msgFooter">${this.timestamp}</p>\
                    </div>`
        }
    }  
}

// DISCORDJS SHIT
var discordConf = require('./discord/config');

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});
  
client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);

    var activeServers = JSON.parse(fs.readFileSync('./discord/servers.json', 'utf8'));

    var exists = activeServers.filter((c) => {
        return c['id'] == guild.id;
    }).length == 1;

    if(!exists) {
        var ez = generateVerification(6);
        var ezTaken = activeServers.filter((c) => {
            return c['ez'] == ez;
        }).length == 1;
    
        if(!ezTaken) {
            activeServers.push({id: guild.id, ez: ez});
        } else {
            ez = generateVerification(7);
            activeServers.push({id: guild.id, ez: ez});
        }
        
        
        var genChat = client.guilds.get(guild.id)['channels'].filter((c) => {
            return c.name == "general" && c.type == "text";
        }).map((o) => {
            return o.id
        })

        client.guilds.get(guild.id).channels.get(genChat[0]).send("Hello! I'm now activated, wahoo! To join this channel on Yeetcord, either enter the code: '"+ez+"' into the join area, or go to https://yeetcord.tk/join/" + ez + "! It is recommended to either pin this message or put it in somewhere easy to find, but you can always run `!yeetcord id` to get it back :D Enjoy!")

        fs.writeFile('./discord/servers.json', JSON.stringify(activeServers), 'utf8');    
    }
    
});
  
client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
    var activeServers = JSON.parse(fs.readFileSync('./discord/servers.json', 'utf8'));
    activeServers = activeServers.filter((g) => {
        return guild.id !== g.id
    });

    fs.writeFile('./discord/servers.json', JSON.stringify(activeServers), 'utf8');    

});


client.on('message', async message => {
    if(message.author.bot) return;
    var prefix = discordConf.prefix;

    var commandStr = message.content.split(" ");

    if(commandStr[0] == prefix) {
        var activeServers = JSON.parse(fs.readFileSync('./discord/servers.json', 'utf8'));

        var server = activeServers.filter((g) => {
            return g.id == message.guild.id
        });

        if(commandStr.length == 1) {
            message.reply("Hello! The ID of this server is: `" + server[0]['ez'] + "`\nTo verify your account, please type: `!yeetcord verify <uid/tag> <verification code> <username>`\nCan't find the code? If it's not above the 'Logout' button on Yeetcord, you're already verified!")
        } else {
            switch(commandStr[1]) {
                case "verify":
                    if(commandStr[4] !== undefined) {
                        message.reply("Please hold a moment while I verify you...");
                        mongo.verifyUser(commandStr[2], commandStr[3], message.author.toString(), commandStr[4]).then((resp) => {
                            if(resp) {
                                message.reply("You're all set! Enjoy verification :D (Note: You will now need to relogin)");
                            } else {
                                message.reply("Hmm, that code didn't work.")
                            }
                        })
                    } else {
                        message.reply("Please send you're tag, verifiation code, and username along!")
                    }
                    break;
            }
        }
    } else {
        var newMsg = new Message(message.author.username, message.content, message.createdTimestamp, true, message.guild.id, message.channel.id, message.id);

        newMsg.message = escapeHtml(newMsg.message);
        
        io.to(newMsg.guild).emit('receive message', JSON.stringify(newMsg));
    }
})
  
client.login(discordConf.token);