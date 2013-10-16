'use strict';

/* Directives */


/* Controllers */
define(['lib/angular'],function(angular){
	angular.module('directives', []).
	  directive('appVersion', ['version', function(version) {
	    return function(scope, elm, attrs) {
	      elm.text(version);
	    };
	  }]);
});
