Players = new Meteor.Collection("players");
Games = new Meteor.Collection("games");
Points = new Meteor.Collection("points");

var currentPlayers = [];
var currentScore = [];
var currentPoints = [];
var longestStreak = {};
var currentStreak = {};
var currentPlayersDepend = new Deps.Dependency;
var currentPointsDepend = new Deps.Dependency;
var currentScoreDepend = new Deps.Dependency;

Router.configure({
	autoRender: false
});

Router.after(renderNavagation);

Router.map(function() {
	this.route('home', {path: '/', template:'gameSetup'});
	this.route('game', {path:'/game', template:'gameSetup'});
	this.route('gameSetup', {path:'/game/setup', template:'gameSetup'});
	this.route('gamePlay', {path:'game/play', template:'gamePlay'});
	this.route('gameResults', {path:'game/results', template:'gameResults'});
	this.route('players', {path:'/players'});
	this.route('stats', {path:'/stats'});
});

/**
 * Game Setup 
 */

Template.gameSetup.players = function() {
	currentPlayersDepend.depend();
	return currentPlayers;
};

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
			points: [],
			status: "in progress"
		});
		Session.set('game', game);
		Router.go('gamePlay');
	}
});

/**
 * Game Play Functions
 */

Template.gamePlay.server = function() {
	currentPlayersDepend.depend();
	return currentPlayers[0] != undefined ? currentPlayers[0] : false;
};

Template.gamePlay.isPlaying = function() {
	return isPlaying();
};

Template.gamePlay.reciever = function() {
	currentPlayersDepend.depend();
	return currentPlayers[1] != undefined ? currentPlayers[1] : false;
};

Template.gamePlay.queue = function() {
	currentPlayersDepend.depend();
	return currentPlayers.slice(2);
};

Template.gamePlay.game = function() {
	return Games.find(Session.get('game')).players;
};

Template.gamePlay.events({
	'click button.endGame': function() {
		Router.go('gameResults');
	},
	'click button.newGame': function() {
		Session.set('game', '');
		Router.go('gameSetup');
	},
	'click button.serverAce': function() {
		pushPoint({
			winner: currentPlayers[0],
			how: 'serve'
		});
		rotatePlayers(currentPlayers[0]);
	},
	'click button.serverRally': function() {
		pushPoint({
			winner: currentPlayers[0],
			how: 'rally'
		});
		rotatePlayers(currentPlayers[0]);
	},
	'click button.serverFault': function() {
		pushPoint({
			winner: currentPlayers[1],
			how: 'serve'
		});
		rotatePlayers(currentPlayers[1]);
	},
	'click button.recieverRally': function() {
		pushPoint({
			winner: currentPlayers[1],
			how: 'rally'
		});
		rotatePlayers(currentPlayers[1]);
	}
});

function pushPoint(point) {
	var realPoint = {
		server: currentPlayers[0],
		reciever: currentPlayers[1],
		winner: point.winner,
		how: point.how
	};
	currentPoints.push(realPoint);
	currentPointsDepend.changed();
}

function rotatePlayers(winner) {
	if (currentPlayers[0]._id == winner._id) {
		var loser = currentPlayers.splice(1, 1)[0];
		var newServer = currentPlayers.splice(1, 1)[0];
		currentPlayers.unshift(newServer);
		currentPlayers.push(loser);
	} else {
		var loser = currentPlayers.shift();
		var newServer = currentPlayers.splice(1, 1)[0];
		currentPlayers.unshift(newServer);
		currentPlayers.push(loser);
	}
	updateStats(winner);
	currentPlayersDepend.changed();
}

function updateStats(winner) {
	//winner
	var changed = false;
	for (i in currentScore) {
		if (currentScore[i].player._id == winner._id) {
			currentScore[i].score++;
			changed = true;
		}
	}
	if (!changed) {
		currentScore.push({player: winner, score: 1});
	}
	//streak
	if (currentStreak.player != undefined && currentStreak.player._id == winner._id) {
		currentStreak.length++;
	} else {
		currentStreak = {
			player: winner,
			length: 1
		};
	}
	if (longestStreak.score == undefined || currentStreak.score > longestStreak.score) {
		longestStreak = currentStreak;
	}
	currentScoreDepend.changed();
}

/**
 * Game Results 
 */

Template.gameResults.isPlaying = function() {
	return isPlaying();
};

Template.gameResults.events({
	'click button.newGame': function() {
		Games.update(Session.get('game'), {
			date: new Date(),
			players: currentPlayers,
			points: currentPoints,
			score: currentScore,
			longestStreak: longestStreak,
			status: "complete"
		});
		Session.set('game', '');
		currentScore = [];
		currentPoints = [];
		longestStreak = {};
		currentStreak = {};
		Router.go('gameSetup');
	},
	'click button.resumeGame': function() {
		Router.go('gamePlay');
	}
});

/**
 * Players Functions 
 */

Template.players.players = function() {
	return Players.find();
};

Template.players.playersExist = function() {
	return Players.findOne() != undefined ? true : false;
};

Template.players.events({
	'submit': function(e) {
		e.preventDefault();
		console.log(e);
		Players.insert({name: playerName.value});
		playerName.value = "";
	}
});

/**
 * Stats
 */

Template.stats.isPlaying = function() {
	return isPlaying();
};

Template.stats.currentPoints = function() {
	currentPointsDepend.depend();
	return currentPoints;
};

Template.stats.games = function() {
	return Games.find({status: "complete"});
};

Template.stats.playerList = function() {
	currentScoreDepend.depend();
	var string = "";
	for (i in currentScore) {
		if (string != "") {
			string += ", ";
		}
		string += currentScore[i].player.name + ": " + currentScore[i].score; 
	}
	return string;
};

Template.gameRow.playerList = function() {
	var string = "";
	for (i in this.score) {
		if (string != "") {
			string += ", ";
		}
		string += this.score[i].player.name + ": " + this.score[i].score; 
	}
	return string;
};

Template.gameRow.winner = function() {
	if (this.date == undefined) return false;
	var winner = this.score[0];
	for (i in this.score) {
		if (this.score[i].score > winner.score) {
			winner = this.score[i];
		}
	}
	return winner.player.name;
};

Template.gameRow.events({
	'click button.removeGame': function() {
		Games.remove(this._id);
	}
});

//other

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

function renderNavagation() {
	var elements = document.getElementsByClassName('navagation-link');
	for (i in elements) {
		if (elements[i].dataset == undefined) continue;
		if (Router.current().template.indexOf(elements[i].dataset.path) != -1) {
			elements[i].className = "navagation-link active";
		} else {
			elements[i].className = "navagation-link";
		}
	}
}

Template.navagation.getActiveClass = function(tabName) {
	if (window.location.pathname.indexOf(tabName) != -1) {
		return 'active';
	}
	return '';
};

Meteor.startup(function() {
	if (Players.find().length == 0) {
		Players.insert({name: "Tommy"});
		Players.insert({name: "Caleb"});
		Players.insert({name: "Ben"});
	}
});
