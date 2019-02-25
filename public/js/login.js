function signup() {
    var username = $('#createUsername').val();
    var password = $('#createPassword').val();

    var req = new createReq('/users/create', {}, {
        username: username,
        password: password
    });

    $('button').addClass('waiting');
    $("button").attr("disabled", "disabled");

    if((username !== '') && (password !== '')) {
        req.send(req.post).then((resp) => {
            resp = JSON.parse(resp);
            if(resp['status'] == "complete") {
                $('.alertMsg').text("Created + Logged in, you will be redirected momentarily");
                $('.alertSuccess').show(500);
                setTimeout(function() {
                    $('.alertSuccess').hide(500);
                }, 3000)

                var today = new Date();
                var expire = new Date();
                expire.setTime(today.getTime() + 3600000*24*7);

                document.cookie = "username=" + username + ";expires="+expire.toGMTString();
                document.cookie = "token=" + resp['token'] + ";expires="+expire.toGMTString();

                
                localStorage.setItem('auth', JSON.stringify({username: username, token: resp['token'], uid: resp['uid'], code: resp['code']}));
                localStorage.setItem('servers', JSON.stringify(resp['servers']));

                window.location.href = '/';
            } else {
                $('.alertMsg').text("That user already exists!");
                $('.alertDanger').show(500);
                setTimeout(function() {
                    $('.alertDanger').hide(500);
                }, 3000)
                $('button').removeClass('waiting');
                $("button").removeAttr('disabled');
            }
        })
    } else {
        $('.alertMsg').text("Please type in a username and password!");
        $('.alertDanger').show(500);
        setTimeout(function() {
            $('.alertDanger').hide(500);
        }, 3000)
        $('button').removeClass('waiting');
        $("button").removeAttr('disabled');
    }
}

function login() {
    var username = $('#loginUsername').val();
    var password = $('#loginPassword').val();

    var req = new createReq('/users/login', {}, {
        username: username,
        password: password,
    });

    $('button').addClass('waiting');
    $("button").attr("disabled", "disabled");

    if((username !== '') && (password !== '')) {
        req.send(req.post).then((resp) => {
            resp = JSON.parse(resp);
            console.log(resp);
            if(resp['status'] == "complete") {
                $('.alertMsg').text("Logged in, you will be redirected momentarily");
                $('.alertSuccess').show(500);
                setTimeout(function() {
                    $('.alertSuccess').hide(500);
                }, 3000)

                var today = new Date();
                var expire = new Date();
                expire.setTime(today.getTime() + 3600000*24*7);

                document.cookie = "username=" + username + ";expires="+expire.toGMTString();
                document.cookie = "token=" + resp['token'] + ";expires="+expire.toGMTString();
                if(resp['verified'] !== true) {
                    localStorage.setItem('auth', JSON.stringify({username: username, token: resp['token'], uid: resp['uid'], code: resp['code']}));
                } else {
                    localStorage.setItem('auth', JSON.stringify({username: username, token: resp['token'], uid: resp['uid'], us: resp['userString'], verified: true}));

                }
                localStorage.setItem('servers', JSON.stringify(resp['servers']));
                window.location.href = '/';

            } else {
                $('.alertMsg').text("Username/password incorrect");
                $('.alertDanger').show(500);
                setTimeout(function() {
                    $('.alertDanger').hide(500);
                }, 3000)
                $('button').removeClass('waiting');
                $("button").removeAttr('disabled');
            }
        })
    } else {
        $('.alertMsg').text("Please type in a username and password!");
        $('.alertDanger').show(500);
        setTimeout(function() {
            $('.alertDanger').hide(500);
        }, 3000)
        $('button').removeClass('waiting');
        $("button").removeAttr('disabled');
    }
}