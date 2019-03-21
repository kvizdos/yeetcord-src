var activeUsers = JSON.parse(localStorage.getItem('active users')) !== null ? JSON.parse(localStorage.getItem('active users')) : [];

var myUsername = JSON.parse(localStorage.getItem('auth'))['username'];
function findTag(word, where) {
    var username = word.substr(1);

    if(word.indexOf('@') == 0 && word.length !== 1) {
        var found = activeUsers.filter((u) => {
            console.log("HERE: " + u.username);
            return (u.username.indexOf(username) >= 0 || u.username == username);
        }).slice(0, 3);

        console.log(where + " - " + found);

        renderFound(where, found);
        return;
    } else {
        renderFound(where, [], true);
        return;
    }
}

function renderFound(where, found, disable = false) {
    var newText = "";

    if(!disable) {
        $(where).show(100);
        found.forEach((f) => {
            console.log(f)

            newText += "<p>" + f.username + "</p>"
        })
        $(where).html(newText);
    } else {
        $(where).hide(100);
    }
}

function ifTagged(msg) {
    if(msg == undefined) return false;

    if(msg.indexOf('@' + myUsername) >= 0) {
            var allow = false;
            msg.split(" ").forEach((word) => {
                if(word.split('@' + myUsername).toString() == ["", ""].toString()) allow = true;
            });
            if(allow) {
                return true
            } else {
                return false;
            }
    } else {
        return false;
    }
}