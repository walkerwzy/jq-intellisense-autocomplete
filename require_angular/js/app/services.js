//声明依赖于service, filter, directive的app级别的moudle
define(['lib/angular'],function(angular){
    angular.module('myApp', ['filters', 'services', 'directives', 'controllers']).
      config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
        $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
        $routeProvider.otherwise({redirectTo: '/view1'});
      }]);
});

//srvices.js

define(['lib/angular'],function(angular){
// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('services', []).
  value('version', '0.1');
  // factory('version',function(){return '0.3';});
});

//filters.js

define(['lib/angular'],function(angular){
	angular.module('directives', []).
	  directive('appVersion', ['version', function(version) {
	    return function(scope, elm, attrs) {
	      elm.text(version);
	    };
	  }]);
});

//controllers.js

define(['lib/angular'],function(angular){
	angular.module('controllers', []).
	  controller('MyCtrl1', [function() {

	  }])
	  .controller('MyCtrl2', [function() {

	  }]);
});