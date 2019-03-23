var activeChannel = "";
var activeGuild = "";

function changeChannel(id, element) {
    localStorage.setItem('channel', id);
    $('.activeChannel').removeClass('activeChannel');
    $(element).addClass('activeChannel');

    $('[class^=channel-]').hide();
    $('.channel-' + id).show();

    activeChannel = id;

    getHistory();

    deleteBadges(localStorage.getItem('guild'), localStorage.getItem('channel'));
}
var alreadyOnline = [];
function changeGuild(id, element) {
    socket.emit('change guild', id);
    
    if(!alreadyOnline.includes(id)) {
        socket.emit('go online', JSON.parse(localStorage.getItem('auth'))['username'], id);
        alreadyOnline.push(id);
    } else {
        renderUsers(id);
    }


    $('#contentArea').show();
    $('#channelList').show();
    $('#welcomeScreen').hide();
    $('#userListContainer').children().hide();
    $('.userList-' + id).show();

    $('[class^=channel-]').hide();
    $('.activeChannel').removeClass('activeChannel');
    $('[class^=for-]').hide();
    $('.active').removeClass('active');

    localStorage.setItem('guild', id);
    localStorage.removeItem('channnel');
    $(element).addClass('active');

    $('.for-' + id).show();

    activeGuild = id;
}

function joinServer() {
    var id = $("#modalInput").val();
    var btn = $('#modalButton');
    $('#modalInput').val('');
    $('#modalInput').attr('disabled', true);
    btn.text("Loading");

    if(id !== '') {
        btn.attr("disabled", "disabled");
        btn.addClass('waiting');
        var req = new createReq('/join', {}, {
            username: getCookie('username'),
            id: id
        })

        req.send(req.post).then((resp) => {
            resp = JSON.parse(resp);

            if(resp['status'] == "complete") {
                var servers = JSON.parse(localStorage.getItem('servers')) !== null ? JSON.parse(localStorage.getItem('servers')) : [];
                servers.push(id);
                localStorage.setItem('servers', JSON.stringify(servers));

                updateServers(false);
            } else {
                alert(resp['error']);
            }

            btn.removeClass('waiting');
            btn.removeAttr('disabled');
            $('#modalInput').removeAttr('disabled');
            $('#modalOne').hide();

            btn.text("Join");
        })
    }
}

function sendMessage(mes) {
    var username = getCookie('username');
    var message = mes;
    var msg = new Message(username, message, (new Date).getTime(), JSON.parse(localStorage.getItem('auth'))['verified'], localStorage.getItem('guild'), localStorage.getItem('channel'), generateVerification(), getCookie('token'), JSON.parse(localStorage.getItem('auth'))['us']);
    socket.emit('send message', JSON.stringify(msg));
}