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
                } 
                var message = data[i]['content'];

                var attachments = data[i]['attachments'];

                if(attachments !== undefined && attachments.length > 0) {
                    if(message.length > 0) message += "<br/>";
                    for(var x = 0; x < attachments.length; x++) {
                        message += `<img id="chatImg" onclick='viewImg("${attachments[x]}")' src='${attachments[x]}' width=250 />`;
                    }
                    
                }

                data[i]['timestamp'] = new Timestamp(new Date(data[i]['timestamp']));
                data[i]['timestamp'] = data[i]['timestamp'].toString();

                var tagged = ifTagged(message);
                var timestamp = data[i]['timestamp']

                var user = data[i]['author']

                var mess = function() {
                        if(!tagged) {
                            return `<div id="msg" class="${user}">\
                                        <p id="msgUsername">${user}</p>\
                                        <p id="msgBody">${RichChat(message)}</p>\
                                        <p id="msgFooter">${timestamp}</p>\
                                    </div>`
                        } else {
                            //var notification = new createNotification(user, message, "", '', '', '', '')
                            //notification.ping();
            
                            return `<div id="msg" class='${user}'>\
                                        <p id="msgUsername">${user}</p>\
                                        <p id="msgBody" class="tagged">${RichChat(message)}</p>\
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