moment.locale('pt-br');

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250)

angular.module('rastrodelama', [
  'ui.router',
  'ngDialog',
  'infinite-scroll',
  'firebase',
  'mediaPlayer',
  'fitVids',
  'uiGmapgoogle-maps'
])


.constant('fbDatabase', fbDatabase)

.config(['uiGmapGoogleMapApiProvider',
  function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyByV053mUkTmAfQStWjRpA0sFmAWE_SP6M',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'weather,geometry,visualization'
    });
  }
])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $locationProvider.html5Mode({
      enabled: false
    });
    $locationProvider.hashPrefix('!');

    $stateProvider
    .state('home', {
      url: '/'
    })
    .state('message', {
      url: '/message/:id/',
      controller: 'SingleMessageCtrl'
    })
    .state('login', {
      url: '/login/',
      templateUrl: '/login.html',
      controller: 'AuthCtrl'
    })
    .state('team', {
      url: '/equipe/',
      templateUrl: '/team.html'
    })
    .state('doc', {
      url: '/doc/',
      templateUrl: '/doc.html'
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
])

.run([
  '$rootScope',
  '$location',
  '$window',
  function($rootScope, $location, $window) {
    $rootScope.$on('$stateChangeSuccess', function(ev, toState, toParams, fromState, fromParams) {
      // Analytics
      if($window._gaq) {
        $window._gaq.push(['_trackPageview', $location.path()]);
      }
      // Scroll top
      if(
        fromState.name &&
        (fromState.name != 'message' && toState.name != 'message')
      ) {
        $('html,body').animate({
          scrollTop: 0
        }, 400);
      }
    });
  }
]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['rastrodelama']);
});
