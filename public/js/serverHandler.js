var activeChannel = "";
var activeGuild = "";
var membersHidden = false;

function changeChannel(id, element) {
    localStorage.setItem('channel', id);
    $('.activeChannel').removeClass('activeChannel');
    $(element).addClass('activeChannel');

    $('[class^=channel-]').hide();
    $('.channel-' + id).show();

    activeChannel = id;

    getHistory();

    deleteBadges(localStorage.getItem('guild'), localStorage.getItem('channel'));
    
    $('#serverGuild').text($('.activeChannel')[0].innerText.slice(1, $('.activeChannel')[0].innerText.length));
}
var alreadyOnline = [];
function changeGuild(id, element) {

    if(id == "HOME") {
        $('#contentArea').hide();
        $('#channelList').hide();
        $('#userListContainer').hide();
        $('.active').removeClass('active');
        $('#welcomeScreen').show();

    } else {
        socket.emit('change guild', id);
        var exists = users.filter((u) => {
            return u.username == JSON.parse(localStorage.getItem('auth'))['username'] && u.guild == id;
        }).length == 1;

        if(!exists) {
            socket.emit('go online', JSON.parse(localStorage.getItem('auth'))['username'], id);
            users.push({username: JSON.parse(localStorage.getItem('auth'))['username'], guild: id});
        } else {
            renderUsers(id, users);
        }


        $('#contentArea').show();
        $('#channelList').show();
        $('#welcomeScreen').hide();


        if(!membersHidden) {
            $('#userListContainer').show();

            $('#userListContainer').children().hide();
            $('.userList-' + id).show();
        }
        $('[class^=channel-]').hide();
        $('.activeChannel').removeClass('activeChannel');
        $('[class^=for-]').hide();

        $('.active').removeClass('active');

        localStorage.setItem('guild', id);
        localStorage.removeItem('channnel');
        $(element).addClass('active');

        $('.for-' + id).show();

        var sc = JSON.parse(localStorage.getItem('serverCache'));
        var sInfo = sc.filter((s) => {
            return s.id == id;
        })[0];

        $('#serverInfo #serverName').text(sInfo['name']);

        for(var i = 0; i < sInfo['channels'].length; i++) {
            if(sInfo['channels'][i]['name'] == "general") {
                $('.for-' + sInfo['id']).each((i) => {
                    if($('.for-' + sInfo['id'])[i].innerText == "#general") {
                        changeChannel(sInfo['channels'][i]['id'], $('.for-' + sInfo['id'])[i]);
                    }
                })
            }
        }

        activeGuild = id;
    }
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

function toggleMembers() {
    $('#userListContainer').toggle();
    if(!$("#userListContainer").is(':visible')) {
        $('#contentArea').removeClass('col-sm-9');
        $('#contentArea').addClass('col-sm-10');
        $('.toggleMems').addClass('nbDisabled');
        membersHidden = true;
    } else {
        $('#contentArea').removeClass('col-sm-10');
        $('#contentArea').addClass('col-sm-9');
        $('.toggleMems').removeClass('nbDisabled');
        membersHidden = false;
    }
}