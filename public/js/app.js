moment.locale('pt-br');

angular.module('rastrodelama', [
  'ui.router',
  'firebase',
  'mediaPlayer'
])

.constant('fbDatabase', fbDatabase)

.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
    $locationProvider.hashPrefix('!');

    $stateProvider
    .state('home', {
      url: '/'
    })
    .state('login', {
      url: '/login/',
      templateUrl: '/login.html',
      controller: 'AuthCtrl'
    });

    /*
     * Trailing slash rule
     */
    $urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path(),
      search = $location.search(),
      params;

      // check to see if the path already ends in '/'
      if (path[path.length - 1] === '/') {
        return;
      }

      // If there was no search string / query params, return with a `/`
      if (Object.keys(search).length === 0) {
        return path + '/';
      }

      // Otherwise build the search string and return a `/?` prefix
      params = [];
      angular.forEach(search, function(v, k){
        params.push(k + '=' + v);
      });

      return path + '/?' + params.join('&');
    });

  }
]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['rastrodelama']);
});
