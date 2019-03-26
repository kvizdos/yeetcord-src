var PlayerControl = function() {
    console.log("Listening for keybinds!");
}

var ctx; 
var activeDirection;
var myId;

function applyDirection(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
        socket.emit('pressing direction', 'up')
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        socket.emit('pressing direction', 'right')
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        socket.emit('pressing direction', 'down')
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
        socket.emit('pressing direction', 'left')
    }
}

function releaseDirection(e) {
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */){
        socket.emit('releasing direction', 'up')
    }
    if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */){
        socket.emit('releasing direction', 'right')
    }
    if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */){
        socket.emit('releasing direction', 'down')
    }
    if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */){
        socket.emit('releasing direction', 'left')
    }
}

window.onload = () => {
    var _PC = new PlayerControl();

    document.addEventListener('keydown', applyDirection),
    document.addEventListener('keyup', releaseDirection),

    ctx = document.getElementById('game').getContext('2d');

    ctx.fillText("Loading", 250, 250);
    document.getElementById('nickname').value = localStorage.getItem('bubblio-username');
    document.body.addEventListener("wheel", e=>{
        if(e.ctrlKey)
          event.preventDefault();//prevent zoom
      });
}

function play() {
    localStorage.setItem('bubblio-username', document.getElementById('nickname').value);

    if(!iknowimdead) {
        socket.emit('join game', 'Bubblio', document.getElementById('nickname').value, (id) => {
            document.getElementById('modalContainer').style.display = 'none';

            myId = id;
        });
    } else {
        iknowimdead = false;
        socket.emit('respawn', document.getElementById('nickname').value);
        document.getElementById('modalContainer').style.display = 'none';

    }
}

socket.on('game tick', (players, objects, leaderboard) => {
    renderItems(players, objects);
    renderLb(leaderboard);
})
var iknowimdead = false;
var renderLb = (lb) => {
    document.getElementById('leaderboard').innerHTML = "";
    for(var i = 0; i < lb.length; i++) {
        console.log(lb[i][0])
        document.getElementById('leaderboard').innerHTML += "<p>" + lb[i][0].toString() + ": " + lb[i][1].toString() + "</p>";
    }
}
var renderItems = (players, objects) => {
    ctx.clearRect(0, 0, 5000, 5000);
    
    for(object in objects) {
        //console.log(objects[object]);
        ctx.beginPath();
        ctx.fillStyle = objects[object].color;
        ctx.arc(objects[object].x, objects[object].y, objects[object].size, 0, 12 * Math.PI);
        ctx.closePath();
        ctx.fill()

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
    }

    for(player in players) {
        if(players[player].id == myId && !iknowimdead) {
            window.scrollTo(players[player].position.x - (.5 * window.innerWidth), players[player].position.y - (.5 * window.innerHeight))
            //ctx.translate(1, 0);
            if(players[player].isDead) {
                iknowimdead = true;
                document.getElementById('modalContainer').style.display = 'flex';
            }
        }

        if(!players[player].isDead) {
            ctx.beginPath();
            ctx.fillStyle = players[player].color;

            ctx.arc(players[player].position.x, players[player].position.y, players[player].size, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill()

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";

            ctx.fillText(players[player].username, players[player].position.x, players[player].position.y);
        }
    }
}

