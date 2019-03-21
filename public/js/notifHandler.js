var notesAllowed = false;
var noteForTag = false;

var unreadNotifications = JSON.parse(localStorage.getItem('unreads')) !== null ? JSON.parse(localStorage.getItem('unreads')) : [];
if(localStorage.getItem('settings') == null) {
    localStorage.setItem('settings', JSON.stringify({
        generalNotes: true,
        tagNotes: true 
    }))
}
var settings = JSON.parse(localStorage.getItem('settings'));

function requestPermissions() {
    if(settings['generalNotes'] == true) {
        Notification.requestPermission().then((result) => {
            if(result == 'granted') {
                notesAllowed = true;
                noteForTag = true;

            }
        })
    } 

}

function renderUnreads(skipNotif = false) {
    if(!skipNotif && localStorage.getItem('unreads') !== null) {
        JSON.parse(localStorage.getItem('unreads')).forEach(element => {
            var newNote = new createNotification(element.username, element.body, element.guildName, element.guild, element.channel, activeGuild, activeChannel);
            //newNote.send(true);
        });
    }
}

var createNotification = function(username, body, guildName, guild, channel, activeGuild, activeChannel) {
    this.username = username,
    this.body = body,
    this.guildName = guildName,
    this.guild = guild,
    this.channel = channel,
    this.activeGuild = activeGuild,
    this.activeChannel = activeChannel,
    this.ping = function() {
        if(noteForTag) {
            this.pingStatus = new Notification(this.username + " ("+this.guildName+")", { body: this.body, icon: "/assets/notif.png" });
            setTimeout(this.pingStatus.close.bind(this.status), 4000);
        }
    },
    this.send = function(nopush = false) {

            if(document.hidden && notesAllowed) {
                this.status = new Notification(this.username + " ("+this.guildName+")", { body: this.body, icon: "/assets/notif.png" });
                setTimeout(this.status.close.bind(this.status), 4000);
            }
                var count = !isNaN(parseInt($('.nb-g-' + this.guild).html())) ? parseInt($('.nb-g-' + this.guild).html()) : 0;
                var channelCount = !isNaN(parseInt($('.nb-c-' + this.guild + "-" + this.channel).html())) ? parseInt($('.nb-c-' + this.guild + "-" + this.channel).html()) : 0;
                                
                if(this.activeChannel !== this.channel) $('.nb-c-' + this.guild + "-" + this.channel).text((channelCount + 1).toString());
                if(this.activeGuild !== this.guild) $('.nb-g-' + this.guild).text((count + 1).toString());

                if(this.activeGuild !== this.guild) console.log('.nb-g-' + this.guild + " !");

                if(this.activeGuild !== this.guild) {
                    if(count > 0) {
                        count++;

                        document.title = `(${count}) Yeetcord`
                    } else {
                        document.title = `Yeetcord`
                    }
                }
                if(!nopush) unreadNotifications.push({username: this.username, body: this.body, guildName: this.guildName, guild: this.guild, channel: this.guild, channel: this.channel})
                if(!nopush) localStorage.setItem('unreads', JSON.stringify(unreadNotifications));

    }
}

function deleteBadges(guild, channel, isGuild = true) {
    var newNotes = unreadNotifications.filter((n) => {
        return n.channel != channel;
    });

    $(".nb-g-" + guild).text('');

    $("[class^=nb-c-"+guild+"-]").text('');

    localStorage.setItem('unreads', JSON.stringify(newNotes));
    unreadNotifications = newNotes;

    renderUnreads();
}