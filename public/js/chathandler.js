var alreadySaved = [];

function getHistory() {
    if(alreadySaved.indexOf(localStorage.getItem('channel')) == -1) {
        alreadySaved.push(localStorage.getItem('channel'));
        socket.emit("request history", {channel: localStorage.getItem('channel'), guild: localStorage.getItem('guild')}, function(data) {
            data = data.reverse();
            for(var i = 0; i < data.length; i++) {                
                if(data[i]['author'] == "Yeetcord Proxy") {
                    var a = data[i]['author'];
                    var c = data[i]['content'].split(">>");
                    a = c[0].substr(1, c[0].length - 3);
                    data[i]['author'] = a; 
                    data[i]['content'] = c[1];
                } else {

                }

                data[i]['timestamp'] = new Timestamp(new Date(data[i]['timestamp']));
                data[i]['timestamp'] = data[i]['timestamp'].toString();

                var message = data[i]['content'];

                var tagged = ifTagged(message);
                var timestamp = data[i]['timestamp']

                var user = data[i]['author']

                var mess = function() {

                    if(!tagged) {
                        return `<div id="msg" class="${user}">\
                                    <p id="msgUsername">${user}</p>\
                                    <p id="msgBody">${message}</p>\
                                    <p id="msgFooter">${timestamp}</p>\
                                </div>`
                    } else {
                        var notification = new createNotification(user, message, "", '', '', '', '')
                        notification.ping();
        
                        return `<div id="msg" class='tagged ${user}'>\
                                    <p id="msgUsername">${user}</p>\
                                    <p id="msgBody">${message}</p>\
                                    <p id="msgFooter">${timestamp}</p>\
                                </div>`
                    }

                }
            
                renderMessage(mess, localStorage.getItem('channel'));
            
                var chatContainer = $(".channel-" + localStorage.getItem('channel'));
                chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
            }
        });
    }   
}