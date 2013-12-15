var currentPlayers = [];
var currentPlayersDepend = new Deps.Dependency;

Router.configure({
	autoRender: false
});

Router.map(function() {
	this.route('home', {path: '/', template:'gameSetup'});
	this.route('game', {path:'/game', template:'gameSetup'});
	this.route('gameSetup', {path:'/game/setup', template:'gameSetup'});
	this.route('gamePlay', {path:'game/play', template:'gamePlay'});
	this.route('gameResults', {path:'game/results', template:'gameResults'});
	this.route('players', {path:'/players'});
	this.route('stats', {path:'/stats'});
});

Template.gamePlay.server = function() {
	return Games.findOne(Session.get('game')).players[0] != undefined ?
			Games.findOne(Session.get('game')).players[0] : false;
};

Template.gamePlay.reciever = function() {
	return currentPlayers[1] != undefined ? currentPlayers[1] : false;
};

Template.gamePlay.queue = function() {
	return currentPlayers.slice(2);
};

Template.players.players = function() {
	return Players.find();
};

Template.players.events({
	'submit': function(e) {
		e.preventDefault();
		console.log(e);
		Players.insert({name: playerName.value});
		playerName.value = "";
	}
});

Template.playerRow.events({
	'click button.removePlayer': function() {
		Players.remove(this._id);
	}
});

Template.playerGameRow.events({
	'click button.removePlayer': function() {
		for (i in currentPlayers) {
			if (currentPlayers[i].name == this.name) {
				currentPlayers.splice(i, 1);
				currentPlayersDepend.changed();
			}
		}
	}
});

Template.gameSetup.players = function() {
	currentPlayersDepend.depend();
	return currentPlayers;
};

Template.gamePlay.game = function() {
	return Games.find(Session.get('game')).players;
};

function isPlayerInCurrentGame(player) {
	for (i in currentPlayers) {
		if (currentPlayers[i].name == player.name) {
			return true;
		}
	}
	return false;
}

function isPlaying() {
	return Session.get('game') ? true : false;
}

Template.gameSetup.isPlaying = function() {
	return isPlaying();
};

Template.gameSetup.events({
	'submit': function(e) {
		e.preventDefault();
		var player = Players.findOne({name: document.getElementById('playerName').value});
		if (player) {
			if (!isPlayerInCurrentGame(player)) {
				currentPlayers.push(player);
				currentPlayersDepend.changed();
			} else {
				console.log("Player " + player.name + " is already in the game.");
			}
			document.getElementById('playerName').value = '';
		} else {
			console.log("No player named " + playerName.value + " found.");
		}
	},
	'click button.startGame': function() {
		if (currentPlayers.length < 3) return false;
		var game = Games.insert({
			players: currentPlayers,
			points: []
		});
		Session.set('game', game);
		Router.go('gamePlay');
	}
});

Template.gamePlay.events({
	'click button.endGame': function() {
		Session.set('lastGame', Session.get('game'));
		Session.set('game', '');
		Router.go('gameResults');
	}
});

Template.gameResults.events({
	'click button.newGame' : function() {
		Router.go('gameSetup');
	}
});

Template.navagation.events({
	'click a.routeGameSetup': function() {
		if (isPlaying()) {
			Router.go('gamePlay');
		} else {
			Router.go('gameSetup');
		}
		
	},
	'click a.routePlayers': function() {
		Router.go('players');
	},
	'click a.routeStats': function() {
		Router.go('stats');
	}
});

Meteor.startup(function() {
	if (Players.find().length == 0) {
		Players.insert({name: "Tommy"});
		Players.insert({name: "Caleb"});
		Players.insert({name: "Ben"});
	}
});
