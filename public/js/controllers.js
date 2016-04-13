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

    $scope.unauth = function(reload) {
      $scope.authObj.$unauth();
      $state.go('home', {}, {reload: reload});
    }

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

    var messagesRef = ref.child('messages').orderByChild('reverse_date');
    var publicRef = ref.child('public_messages').orderByChild('reverse_date');

    $scope.loading = true;

    $scope.$watch('user', function(u) {
      if(u) {
        $scope.messages = $firebaseArray(messagesRef);
      } else {
        $scope.messages = $firebaseArray(publicRef);
      }
      $scope.messagesLimit = 5;
      $scope.messages.$loaded().then(function() {
        $scope.loading = false;
      });
    }, true);


    $scope.scroll = _.throttle(function() {
      $scope.messagesLimit = $scope.messagesLimit + 5;
    }, 500);

    $scope.disabledScroll = function(data) {
      return $scope.messagesLimit >= data.length;
    }

    $scope.filteredMessages = [];
    $scope.team = '';
    $scope.selectTeam = function(team) {
      $scope.messagesLimit = 5;
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
        $state.go('home', {}, {reload: true});
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
