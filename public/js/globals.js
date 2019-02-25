var createReq = function(url, headers = {}, data = {}) {
    this.post = {
        "async": true,
        "crossDomain": true,
        "url": url,
        "method": "POST",
        "headers": headers,
        "data": data
    },
    this.get = {
        "async": true,
        "crossDomain": true,
        "url": url + "/?" + $.param(data),
        "method": "GET",
        "headers": headers,
        "processData": false,
        "contentType": false,
    },
    this.send = async function(type) {
        return new Promise((resolve, reject) => {
            $.ajax(type).done(function (response) {
                resolve(response);
            });
        });
    }
}

function Message(user, message, timestamp, isVerified = false, guild, channel, id, token, us = user) {
    this.id = id;
    this.user = user,
    this.message = message,
    this.timestamp = timestamp,
    this.edited = false,
    this.isVerified = isVerified,
    this.channel = channel,
    this.guild = guild,
    this.token = token,
    this.us = us,
    this.getGuild = function() {
        return this.guild
    },
    this.delete = function() {
        console.log(this.user + " - " + this.message + " - " + this.timestamp);
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

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function generateVerification(len = 8) {
    var possibilites = "abcdefghijklmnopqrstuvwxyz1234567890";
    possibilites = possibilites.split("");
    var token = "";

    for(var i = 0; i < len; i++) {
        token += possibilites[Math.floor(Math.random()*(possibilites.length - 1))]
    }

    return token;
}