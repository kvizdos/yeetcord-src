var GameList = function(containerId) {
    this.containerId = containerId,
    this.games = [],
    this.registerGame = (name, description, published, beta, id) => {
        this.games.push({name: name, description: description, published: published, id: id});

        $(this.containerId).append(`
			<div id="game" class="game-${id}">
				<div id="gameContent">
					<h2>${name}</h2>
					<p>${description}</p>
					<button onclick='playGame("${name.toLowerCase()}")'>${published ? !beta ? "Play!" : "Play (beta)!" : "Coming Soon!"}</button>
				</div>
			</div>
        `)

        $('.game-' + id).css('background-image', 'url(/games/'+name.toLowerCase()+'/assets/card.png)');
    }
}

function playGame(game) {
    switch(game) {
        case "bubblio":
            window.location = "/games/bubblio"
            break;
    }
}