'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
	controller('Configure', ['$scope', function($scope) {		
		$scope.players = [
			{name: "Bob", id: 4}
			
		];
		
		$scope.setLocation = function() {
			//load players from location
		}
		
		$scope.createPlayer = function() {
			//sent request to add player, dont forget to add location
			$scope.players.push({name: $scope.newPlayerName});
			$scope.newPlayerName = "";
		};
		
		$scope.deletePlayer = function(player) {
			$scope.players.splice($scope.players.indexOf(player), 1);
		};
	}]).
	controller('Setup', ['$scope', function($scope) {
		$scope.players = [
			{name: "Bob", id: 4}
		];
	}]).
	controller('Play', ['$scope', function($scope) {
		
	}]).
	controller('navController', ['$scope', function($scope) {
		$scope.isCollapsed = true;
	}]);
	
