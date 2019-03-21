// Add user functionality (sockets);

var users = []

var User = function(username, guild, status) {
    this.username = username,
    this.guild = guild
}

socket.on("new user", (username, guild) => {
    var newUser = new User(username, guild);
    users.push(newUser)

    renderUsers(guild);
})

function renderUsers(guild) {
    var usersInGuild = users.filter((u) => {
        return u.guild == guild;
    })

    localStorage.setItem('active users', JSON.stringify(usersInGuild));
    activeUsers = usersInGuild;

    $('.userList-' + guild).empty();

    for(var i = 0; i < usersInGuild.length; i++) {
            $('.userList-' + guild).append(`
            <p>${usersInGuild[i].username}</p>
            `)

    }
}