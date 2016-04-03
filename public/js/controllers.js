angular.module('rastrodelama')

.controller('SiteCtrl', [
  '$scope',
  '$state',
  'fbDatabase',
  '$firebaseAuth',
  function($scope, $state, fbDatabase, $firebaseAuth) {

    $scope.$on('$stateChangeSuccess', function(ev, toState) {
      $('html,body').animate({
        scrollTop: 0
      }, 400);
      if(toState.name == 'home') {
        $scope.isHome = true;
      } else {
        $scope.isHome = false;
      }
    });

    var ref = new Firebase(fbDatabase);

    $scope.authObj = $firebaseAuth(ref);
    $scope.$watch(function() {
      return $scope.authObj.$getAuth();
    }, function(auth) {
      $scope.user = auth;
    });

  }
])

.controller('MessagesCtrl', [
  '$scope',
  'fbDatabase',
  '$firebaseArray',
  '$firebaseAuth',
  function($scope, fbDatabase, $firebaseArray, $firebaseAuth) {

    var ref = new Firebase(fbDatabase);

    $scope.authObj = $firebaseAuth(ref);
    $scope.$watch(function() {
      return $scope.authObj.$getAuth();
    }, function(auth) {
      $scope.user = auth;
    });

    var messagesRef = ref.child('messages');
    var publicRef = ref.child('public_messages');

    $scope.$watch('user', function(u) {
      if(u) {
        $scope.messages = $firebaseArray(messagesRef);
      } else {
        $scope.messages = $firebaseArray(publicRef);
      }
    }, true);

  }
])

.controller('AuthCtrl', [
  '$rootScope',
  '$scope',
  '$state',
  'fbDatabase',
  '$firebaseAuth',
  function($rootScope, $scope, $state, fbDatabase, $firebaseAuth) {
    var ref = new Firebase(fbDatabase);
    $scope.authObj = $firebaseAuth(ref);

    $scope.$watch(function() {
      return $scope.authObj.$getAuth();
    }, function(auth) {
      if(auth && $state.current.name == 'login') {
        $state.go('home');
      }
    });

    $scope.auth = function(credentials) {
      $scope.authObj.$authWithPassword(credentials).then(function(data) {
        $rootScope.$broadcast('logged.in');
      }, function(err) {
        console.log('Auth failed', err);
      });
    }
  }
]);
