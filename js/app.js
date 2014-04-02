'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/configure', {templateUrl: 'partials/configure.html', controller: 'Configure'});
	$routeProvider.when('/setup', {templateUrl: 'partials/setup.html', controller: 'Setup'});
	$routeProvider.when('/play', {templateUrl: 'partials/play.html', controller: 'Play'});
	$routeProvider.otherwise({redirectTo: '/configure'});
}]);