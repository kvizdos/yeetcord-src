var auth = JSON.parse(localStorage.getItem('auth'));
var _Modal = new Modal('#modalOne');
var _ModalImg = new ImageModal('#imgModal');
var Emoji = new Emoji("Main");
var Progress = new Progress('#progressContainer', 0);
var CM = new ContextMenu('#contextMenu');
var _GameList = new GameList("#gamesContainer");

if(auth == null) {
    alert("Username/token mismatch! Please relogin!");
        deleteCookie('username');
        deleteCookie('token');
        localStorage.clear();
        window.location.href = '/login'
}
var username = auth['username'];
var token = auth['token'];

if(localStorage.getItem('settings') == null) {
    localStorage.setItem('settings', JSON.stringify({
        generalNotes: true,
        tagNotes: true 
    }))
}

function mismatchCheck(u, t) {
    if(u !== getCookie('username') || t !== getCookie('token') || auth == null) {
        alert("Username/token mismatch! Please relogin!");
        deleteCookie('username');
        deleteCookie('token');
        localStorage.clear();
        window.location.href = '/login'
    } else {
        return true;
    }
}

function updateServers(docache = localStorage.getItem('serverCache') !== null ? true : false, cache = localStorage.getItem('serverCache'), outbound = true) {

        if(docache) {
            var data = JSON.parse(cache)
            for(var i = 0; i < data.length; i++) {
                var shortName = data[i]['name'];
                shortName = shortName.match(/\b(\w)/g);
                shortName = shortName.join("");
                $('#serverContainer').append(`<p id="serverName" onclick="changeGuild('${data[i]['id']}', this)">${shortName} <span class='nb-g-${data[i]['id']}'></span></p>`)
                
                $('#userListContainer').append(`
                <div class="col-sm-1 userList-${data[i]['id']}" id="userList">
                    <br>
                </div>
                `)
                for(let c = 0; c < data[i]['channels'].length; c++) {
                    $('#channelContainer').append(`<p id="channelName" class="for-${data[i]['id']}" onclick="changeChannel('${data[i]['channels'][c]['id']}', this)">#${data[i]['channels'][c]['name']} <span class='nb-c-${data[i]['id']}-${data[i]['channels'][c]['id']}'></span></p>`);
                    $('#messages').append(`
                    <div id="messageArea" class="channel-${data[i]['channels'][c]['id']}">
                        <div id="msg">
                            <p id="msgUsername">Initializing</p>
                            <p id="msgBody">It should be live :D</p>
                        </div>
                    </div>
                    `);
                }
            }
        }
    
        if(outbound) {
            socket.emit('update servers', auth['username'], function(data) {
                $('#serverContainer').empty();
                $('#channelContainer').empty();
                $('#messages').empty();
                $('#serverContainer').append(`
                    <div id="serverName" class="homeServer" onclick="changeGuild('HOME', '')">
                        Home
                    </div>`)

                localStorage.setItem('serverCache', JSON.stringify(data));
                for(var i = 0; i < data.length; i++) {
                    var shortName = data[i]['name'];
                    shortName = shortName.match(/\b(\w)/g);
                    shortName = shortName.join("");
                    shortName = shortName.toUpperCase();
                    $('#serverContainer').append(`<p id="serverName" onclick="changeGuild('${data[i]['id']}', this)">${shortName} <span class='nb-g-${data[i]['id']}'></span></p>`)
                    
                    $('#userListContainer').append(`
                    <div class="col-sm-1 userList-${data[i]['id']}" id="userList">
                        <br>
                    </div>`);
                    
                    for(let c = 0; c < data[i]['channels'].length; c++) {
                        $('#channelContainer').append(`<p id="channelName" class="for-${data[i]['id']}" onclick="changeChannel('${data[i]['channels'][c]['id']}', this)">#${data[i]['channels'][c]['name']} <span class='nb-c-${data[i]['id']}-${data[i]['channels'][c]['id']}'></span></p>`);
                        $('#messages').append(`
                        <div id="messageArea" class="channel-${data[i]['channels'][c]['id']}">
                            <div id="msg">
                                <p id="msgUsername">Initializing</p>
                                <p id="msgBody">It should be live :D</p>
                            </div>
                        </div>
                        `);
                    }
                }

                $('#serverContainer').append(`<div id="hr"></div><p id="serverName" onclick="joinGuild()">Join</p>`)

            })
        }
}

updateServers();

mismatchCheck(username, token);

function generateVerification(len = 8) {
    var possibilites = "abcdefghijklmnopqrstuvwxyz1234567890";
    possibilites = possibilites.split("");
    var token = "";

    for(var i = 0; i < len; i++) {
        token += possibilites[Math.floor(Math.random()*(possibilites.length - 1))]
    }

    return token;
}

var messages = [];


var channel = localStorage.getItem('channel');

$(document).ready(function() {
    var input = document.getElementById("newMsg");
    Progress.addPercent(16.66);
    var room = `.channel-${channel}#messageArea`;
    Progress.addPercent(16.66);
    $('[class^=userList-]').hide();
    Progress.addPercent(16.66);

    loadItems();
    Progress.addPercent(16.66);
    _Modal.register();
    Progress.addPercent(16.66);
    _ModalImg.register();
    //CM.register();
    _GameList.registerGame("Bubblio", "A recreation of the popular game Agario. Early beta. Please report any bugs to the Yeetcord Central server!!", false, true, "bubblio");
    Progress.addPercent(16.66);

    setTimeout(function() {
        $('#loadingScreen').hide();
        $('#msgArea').show();
        $(room).show();
    }, 500)
    
    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
      // Cancel the default action, if needed
      var newMess = $('#newMsg').val();

      findTag(newMess.split(" ").slice(-1)[0], "#tagList");

      var m = newMess.split(" ").slice(-1)[0];
      if(m.startsWith(":")) {
        if(m.endsWith(":")) m = newMess.split(" ").slice(-1)[0].substr(0, m.length - 1);
        Emoji.search(m.slice(1), "#emojiList");
      } else {
          $("#emojiList").hide(100);
        }

      event.preventDefault();
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Trigger the button element with a click
    
        if(mismatchCheck(username, token) && newMess !== '') {
            $("#emojiList").hide(100);

            if(newMess.length < 2000) {
                $('#newMsg').val("");
                sendMessage(newMess);
                $('#tagList').hide(100);
            } else {
                _Modal.header = "Uh oh!";
                _Modal.text = "That message is too long!";
                _Modal.show();
            }
            //            socket.emit('send message', JSON.stringify({user: username, token: token, msg: newMess, channel: channel}));
        }
      }
    });
});

socket.on('receive message', function(msg) {
    msg = JSON.parse(msg);
   
    var user = msg['user'];
    var message = msg['message'];
    var channel = msg['channel'];
    var attachments = msg['attachments'];

    var timestamp = new Timestamp(new Date(msg['timestamp'])).toString();

    var tagged = ifTagged(message);

    // COMPARE $.parseHTML($('.channel-' + channel).children().last().html())[1].innerText

    message = RichChat(message);

    var mess = function() {

        if(attachments !== undefined && attachments.length > 0) {
            if(message.length > 0) message += "<br/>";
            for(var i = 0; i < attachments.length; i++) {
                message += `<img id="chatImg" class="imgPreload" onclick='viewImg("${attachments[i]}")' src='${attachments[i]}' width=250 />`;
            }
        }

        if($('.channel-' + channel).children().last()[0].className.indexOf(user) == -1) {
            if(!tagged) {
                return `<div id="msg" class="${user}">\
                            <p id="msgUsername">${user}</p>\
                            <p id="msgBody">${message}</p>\
                            <p id="msgFooter">${timestamp}</p>\
                        </div>`
            } else {
                var notification = new createNotification(user, message, "", '', '', '', '')
                notification.ping();

                return `<div id="msg" class='${user}'>\
                            <p id="msgUsername">${user}</p>\
                            <p id="msgBody" class="tagged">${message}</p>\
                            <p id="msgFooter">${timestamp}</p>\
                        </div>`
            }
        } else {
            if($('.channel-' + channel).children().last().children().length == 3) {
                $('.channel-' + channel).children().last().children()[2].remove();
            } else {
                $('.channel-' + channel).children().last().children()[1].remove();
            }

            if(!tagged) {
                
                return `<div id="msg" class="msgNoBorder ${user}">
                            <p id="msgBody">${message}</p>\
                            <p id="msgFooter">${timestamp}</p>\
                        </div>`
            } else {
                var notification = new createNotification(user, message, "", '', '', '', '')
                notification.ping();

                return `<div id="msg" class='msgNoBorder ${user}'>\
                            <p id="msgBody" class="tagged">${message}</p>\
                            <p id="msgFooter">${timestamp}</p>\
                        </div>`
            }
        }
    }

    renderMessage(mess, channel);
    var newNote = new createNotification(user, message, "", msg['guild'], msg['channel'], activeGuild, activeChannel);
    newNote.send();

    var chatContainer = $(".channel-" + localStorage.getItem('channel'));
    chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
});

socket.on('mismatch', function() {
    alert("Username/token mismatch! Please relogin!");
    deleteCookie('username');
    deleteCookie('token');
    localStorage.clear();
    window.location.href = '/login'
})

function renderMessage(message, channel) {
    var room = `.channel-${channel}#messageArea`

    $(room).append(message);
    
}

function sendMsg(msg) {
    time = new Date();
    time = time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    var mes = new Message(username, msg, time);
    messages.push(mes);
    
    //socket.emit('send message', JSON.stringify({user: "Kento", msg: msg}));
}

function logout() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    localStorage.clear();

    window.location.href = "/";
}

function joinGuild() {
    _Modal.header = "Join a guild";
    _Modal.text = "Please input the guild id below.<br><a href='https://discordapp.com/oauth2/authorize?client_id=545363820101763115&scope=bot&permissions=8'>Looking to add the proxy to your own server? Click here!</a>";
    _Modal.showActions(1, "ID Here", "Join", joinServer);
}

function viewImg(img) {
    _ModalImg.show(img);
}