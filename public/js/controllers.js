angular.module('rastrodelama')

.controller('Messages', [
  '$scope',
  'fbDatabase',
  '$firebaseArray',
  function($scope, fbDatabase, $firebaseArray) {
    var ref = new Firebase(fbDatabase).child('messages');
    $scope.messages = $firebaseArray(ref);
  }
]);
