angular.module('rastrodelama')

.directive('message', [
  function() {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      templateUrl: '/message.html',
      replace: true,
      link: function(scope, element, attrs) {

        scope.getTemplateUrl = function() {
          if(scope.data) {
            if(scope.data.photo) {
              scope.data.type = 'image';
            } else if(scope.data.voice || scope.data.audio) {
              scope.data.type = 'audio';
            } else if(scope.data.document) {
              scope.data.type = 'file';
            } else if(scope.data.location) {
              scope.data.type = 'map';
            } else if(scope.data.video) {
              scope.data.type = 'video';
            } else if(scope.data.text) {
              scope.data.type = 'text';
            }
          }
          if(scope.data.type) {
            return '/messages/' + scope.data.type + '.html';
          } else {
            return null
          }
        }

      }
    }
  }
])

.directive('messageImage', [
  function() {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      template: '<img ng-src="{{src}}" />',
      replace: true,
      link: function(scope, element, attrs) {

        scope.$watch('data', function(data) {

          scope.src = '/file/' + data[data.length-1].file_id;

        });

      }
    }
  }
])

.directive('messageAudio', [
  '$sce',
  function($sce) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      template: '<div class="audio-container"><audio media-player="mediaPlayer" playlist="playlist"></audio></div>',
      replace: true,
      transclude: true,
      controller: [
        '$scope',
        '$element',
        '$transclude',
        function($scope, $element, $transclude) {

          $scope.$watch('data', function() {
            var id = '';
            if($scope.data.voice) {
              id = $scope.data.voice.file_id;
            } else if($scope.data.audio) {
              id = $scope.data.audio.file_id;
            }
            if(id) {
              $scope.playlist = [{ src: '/file/' + id }];
            }
          });

          $transclude($scope, function(transEl) {
            $element.append(transEl);
          });
        }
      ],
      link: function(scope, element, attrs) {}
    }
  }
])

.directive('messageVideo', [
  '$sce',
  function($sce) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      template: '<div class="video-container"><video media-player="mediaPlayer" playlist="playlist"></video></div>',
      replace: true,
      transclude: true,
      controller: [
        '$scope',
        '$element',
        '$transclude',
        function($scope, $element, $transclude) {
          $scope.$watch('data', function() {
            var id = '';
            if($scope.data.video) {
              id = $scope.data.video.file_id;
            }
            if(id) {
              $scope.playlist = [{ src: '/file/' + id }];
            }
          });
          $transclude($scope, function(transEl) {
            $element.append(transEl);
          });
        }
      ],
      link: function(scope, element, attrs) {}
    }
  }
]);
