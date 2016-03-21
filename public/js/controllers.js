angular.module('rastrodelama')

.controller('Messages', [
  '$scope',
  '$firebaseArray',
  function($scope, $firebaseArray) {
    var ref = new Firebase('https://rastrodelama.firebaseio.com/messages');
    $scope.messages = $firebaseArray(ref);
  }
])

.controller('MediaCtrl', [
  '$scope',
  function() {
    
  }
]);
