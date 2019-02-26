var auth = JSON.parse(localStorage.getItem('auth'));
if(auth == null) {
    alert("Username/token mismatch! Please relogin!");
        deleteCookie('username');
        deleteCookie('token');
        localStorage.clear();
        window.location.href = '/login'
}
var username = auth['username'];
var token = auth['token'];

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
            $('#serverContainer').append(`<p id="serverName" onclick="changeGuild('${data[i]['id']}', this)">${data[i]['name']} <span class='nb-g-${data[i]['id']}'></span></p>`)
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
        socket.emit('update servers', localStorage.getItem('servers'), function(data) {
            $('#serverContainer').empty();
            $('#channelContainer').empty();
            $('#messages').empty();

            localStorage.setItem('serverCache', JSON.stringify(data));
            for(var i = 0; i < data.length; i++) {
                $('#serverContainer').append(`<p id="serverName" onclick="changeGuild('${data[i]['id']}', this)">${data[i]['name']} <span class='nb-g-${data[i]['id']}'></span></p>`)
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
    var room = `.channel-${channel}#messageArea`;

    $(room).show();
    
    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Trigger the button element with a click
        var newMess = $('#newMsg').val();
        if(mismatchCheck(username, token) && newMess !== '') {
            $('#newMsg').val("");
            sendMessage(newMess);
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
    var timestamp = msg['timestamp'];

    var mess = function() {
        return `<div id="msg">\
                    <p id="msgUsername">${user}</p>\
                    <p id="msgBody">${message}</p>\
                    <p id="msgFooter">${timestamp}</p>\
                </div>`
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