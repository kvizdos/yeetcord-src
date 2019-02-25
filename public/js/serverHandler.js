function changeChannel(id, element) {
    localStorage.setItem('channel', id);
    $('.activeChannel').removeClass('activeChannel');
    $(element).addClass('activeChannel');

    $('[class^=channel-]').hide();
    $('.channel-' + id).show();
}

function changeGuild(id, element) {
    socket.emit('change guild', id);
    $('[class^=channel-]').hide();
    $('.activeChannel').removeClass('activeChannel');
    $('[class^=for-]').hide();
    $('.active').removeClass('active');

    localStorage.setItem('guild', id);
    localStorage.removeItem('channnel');
    $(element).addClass('active');

    $('.for-' + id).show();
}

function joinServer() {
    var id = $("#joinId").val();
    var btn = $('#joinServer');
    
    $('#joinId').val('');

    if(id !== '') {
        btn.attr("disabled", "disabled");
        btn.addClass('waiting');
        var req = new createReq('/join', {}, {
            username: getCookie('username'),
            id: id
        })

        console.log(id);
        console.log(getCookie('username'));

        req.send(req.post).then((resp) => {
            resp = JSON.parse(resp);

            if(resp['status'] == "success") {
                var servers = JSON.parse(localStorage.getItem('servers'));
                servers.push(id);
                localStorage.setItem('servers', JSON.stringify(servers));
                updateServers();
                btn.removeClass('waiting');
                btn.removeAttr('disabled');
            } else {
                alert("Invalid join code!");
                btn.removeClass('waiting');
                btn.removeAttr('disabled');
            }
        })
    }
}

function sendMessage(mes) {
    var username = getCookie('username');
    var message = mes;
    var msg = new Message(username, message, "100", JSON.parse(localStorage.getItem('auth'))['verified'], localStorage.getItem('guild'), localStorage.getItem('channel'), generateVerification(), getCookie('token'), JSON.parse(localStorage.getItem('auth'))['us']);
    console.log("Yeeting the message");
    console.log(message);
    socket.emit('send message', JSON.stringify(msg));
}