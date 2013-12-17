Players = new Meteor.Collection("players");
Games = new Meteor.Collection("games");
Points = new Meteor.Collection("points");

var currentPlayers = [],
	currentScore = [],
	currentPoints = [],
	longestStreak = {},
	currentStreak = {};
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
	this.route('statsSingle', {
		path:'/stats/:_id',
		data: function() {
			return Games.findOne(this.params._id);
		},
		template: 'statsSingle'
	});
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
		var player = Players.findOne({name: playerName.value, location: Session.get('gameLocation')});
		if (player) {
			if (!isPlayerInCurrentGame(player)) {
				currentPlayers.push(player);
				currentPlayersDepend.changed();
			} else {
				alert("Player " + player.name + " is already in the game.");
			}
			playerName.value = '';
		} else {
			alert("No player named " + playerName.value + " found.");
		}
	},
	'click button.startGame': function() {
		if (currentPlayers.length < 3) return alert('You must add at least 3 players to a game.');
		var game = Games.insert({
			players: currentPlayers,
			points: [],
			status: "in progress",
			location: Session.get('gameLocation')
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

Template.gamePlay.currentScore = function() {
	return getCurrentScore();
};

Template.gamePlay.events({
	'click button.undoPoint': function() {
		var lastPoint = currentPoints.pop();
		var lastLoser = currentPlayers.pop();
		var queued = currentPlayers.shift();
		currentPlayers.splice(1, 0, queued);
		if (lastPoint.server.name == lastPoint.winner.name) {
			currentPlayers.splice(1, 0, lastLoser);
		} else {
			currentPlayers.unshift(lastLoser);
		}
		for (i in currentScore) {
			if (currentScore[i].player._id == lastPoint.winner._id) {
				currentScore[i].score--;
			}
		}
		currentPointsDepend.changed();
		currentPlayersDepend.changed();
		currentScoreDepend.changed();
		updateStats();
	},
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
	console.log(longestStreak);
	currentScoreDepend.changed();
}

/**
 * Game Results 
 */

Template.gameResults.isPlaying = function() {
	return isPlaying();
};

Template.gameResults.currentPoints = function() {
	return currentPoints;
};

Template.gameResults.events({
	'click button.saveGame': function() {
		if (currentPoints.length < 1) return alert('The game does not have a score.');
		Games.update(Session.get('game'), {
			date: new Date(),
			players: currentPlayers,
			points: currentPoints,
			score: currentScore,
			longestStreak: longestStreak,
			status: "complete",
			location: Session.get('gameLocation')
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
	},
	'click button.newGame' : function() {
		Router.go('gameSetup');
	}
});

function getCurrentScore() {
	currentScoreDepend.depend();
	var string = "";
	for (i in currentScore) {
		if (string != "") {
			string += ", ";
		}
		string += currentScore[i].player.name + ": " + currentScore[i].score; 
	}
	return string;
}

/**
 * Players Functions 
 */

Template.players.players = function() {
	return Players.find({location: Session.get('gameLocation')});
};

Template.players.location = function() {
	return Session.get('gameLocation');
};

Template.players.playersExist = function() {
	return Players.findOne({location: Session.get('gameLocation')}) != undefined ? true : false;
};

Template.players.events({
	'click button.createPlayer': function(e) {
		e.preventDefault();
		if (playerName.value == "") return alert("The player doesn't have a name.");
		Players.insert({name: playerName.value, location: Session.get('gameLocation')});
		playerName.value = "";
	},
	'click button.setLocation': function(e) {
		e.preventDefault();
		if (locationName.value == "") return alert("The location is empty.");
		Session.set('gameLocation', locationName.value);
	}
});

/**
 * Stats
 */

Template.stats.games = function() {
	return Games.find({status: "complete", location: Session.get('gameLocation')});
};

Template.stats.playerList = function() {
	return getCurrentScore();
};

Template.gameRow.playerList = function() {
	var string = "";
	for (i in this.players) {
		if (string != "") {
			string += ", ";
		}
		string += this.players[i].name; 
	}
	return string;
};

Template.gameRow.winner = function() {
	if (this.score == undefined) return false;
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
	},
	'click button.gameStats': function() {
		Router.go('statsSingle', {_id: this._id});
	}
});

Template.statsSingle.points = function() {
	return Router.getData().points;
};

Template.statsSingle.score = function() {
	var string = "";
	var score = Router.getData().score;
	for (i in score) {
		if (string != "") {
			string += ", ";
		}
		string += score[i].player.name + ": " + score[i].score; 
	}
	return string;	
};

Template.statsSingle.events({
	'click button.backToStats': function() {
		Router.go('stats');
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
	return;
}

Meteor.startup(function() {
	if (Players.find({location: Session.get('gameLocation')}).length == 0) {
		Players.insert({name: "Tommy"});
		Players.insert({name: "Caleb"});
		Players.insert({name: "Ben"});
	}
	
	Session.setDefault('gameLocation', 'Earth');
});
