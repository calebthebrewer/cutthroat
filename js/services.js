'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	value('version', '0.1').
	service('gamePlayers', function() {
		var players = [];
		
		return {
			getPlayers: function() {
				return players;
			},
			setPlayers: function(newPlayers) {
				players = newPlayers;
			}
		}
	});
