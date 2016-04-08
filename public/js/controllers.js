angular.module('rastrodelama')

.controller('SiteCtrl', [
  '$scope',
  '$state',
  'fbDatabase',
  '$firebaseAuth',
  function($scope, $state, fbDatabase, $firebaseAuth) {

    $scope.$on('$stateChangeSuccess', function(ev, toState) {
      $scope.isHome = true;
      if(toState.name !== 'message') {
        if(toState.name == 'home') {
          $scope.isHome = true;
        } else {
          $scope.isHome = false;
        }
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

    var scrollRef = false;

    $scope.$watch('user', function(u) {
      if(scrollRef) {
        scrollRef.scroll.destroy();
      }
      if(u) {
        scrollRef = new Firebase.util.Scroll(messagesRef, 'reverse_date');
      } else {
        scrollRef = new Firebase.util.Scroll(publicRef, 'reverse_date');
      }
      $scope.messages = $firebaseArray(scrollRef);
      $scope.messages.scroll = scrollRef.scroll;
    }, true);

    $scope.loading = true;

    $scope.$watch(function() {
      if(scrollRef.scroll) {
        return scrollRef.scroll.hasNext();
      } else {
        return true;
      }
    }, _.debounce(function(has) {
      $scope.loading = has;
    }), 100);

    $scope.filteredMessages = [];
    $scope.team = '';
    $scope.selectTeam = function(team) {
      $scope.team = team;
    };

  }
])

.controller('SingleMessageCtrl', [
  '$scope',
  '$state',
  '$stateParams',
  'fbDatabase',
  '$firebaseObject',
  'ngDialog',
  function($scope, $state, $stateParams, fbDatabase, $firebaseObject, ngDialog) {
    var ref = new Firebase(fbDatabase);
    var messageRef = ref.child('public_messages/' + $stateParams.id);
    $scope.data = $firebaseObject(messageRef);
    $scope.dialog = ngDialog.open({
      plain: true,
      template: '<message data="data" date-format="full"></message>',
      scope: $scope,
      preCloseCallback: function(value) {
        $scope.dialog = false;
        $state.go('home');
        return true;
      }
    });
    $scope.$on('$stateChangeSuccess', function(ev, toState, toParams, fromState) {
      if(toState.name == 'message' && !fromState.name) {
        $('html,body').animate({
          scrollTop: $('#messages').offset().top
        }, 400);
      }
    })
    $scope.$on('$stateChangeStart', function() {
      if($scope.dialog) {
        $scope.dialog.close();
      }
    });
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
