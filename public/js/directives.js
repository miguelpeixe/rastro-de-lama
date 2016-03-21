angular.module('rastrodelama')

.directive('timeline', [
  function() {
    return {
      restrict: 'E',
      scope: {
        'items': '=',
        'dateParam': '='
      },
      template: '<div class="timeline"></div>',
      replace: true,
      link: function(scope, element, attrs) {},
      controller: [
        '$scope',
        '$element',
        '$compile',
        '$filter',
        function($scope, $element, $compile, $filter) {

          $element.append('<div class="clearfix"><div class="left-col"></div><div class="right-col"></div></div>');

          var dayHeader = '<header><h2>{{formattedDate}}</h2></header>';

          var itemTemplate = '<message class="timeline-item" data="item"></message>';

          $scope.$watch('items', function() {

            jQuery($element).empty();

            var items = $filter('orderBy')($scope.items, $scope.dateParam, true);


            if(items) {

              var itemsPerDay = {};

              items.forEach(function(item, i) {

                var date = moment(item.date*1000);
                var day = date.format('DD/MM/YYYY');

                if(!itemsPerDay[day])
                  itemsPerDay[day] = [];

                itemsPerDay[day].push(item);

              });

              for(var day in itemsPerDay) {

                var dayScope = $scope.$new(true);

                dayScope.formattedDate = day;

                var $day = $compile('<section class="timeline-day clearfix">' + dayHeader + '<div class="left-col"></div><div class="right-col"></div></section>')(dayScope);

                itemsPerDay[day].forEach(function(item, i) {

                  var child = 'left-col';
                  if(i%2)
                    child = 'right-col';

                  var scope = $scope.$new(true);

                  scope.item = item;

                  $day.find('.' + child).append($compile(itemTemplate)(scope));

                });

                $element.append($day);

              }

            }
          }, true);
        }
      ]
    }
  }
])

.directive('autoFontSize', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'EAC',
      priority: 1001,
      link: function(scope, element, attrs) {
        $timeout(function() {
          var str = jQuery(element).text();
          var fontSize = '1em';
          if(str.length < 15) {
            fontSize = '3em';
          } else if(str.length < 50) {
            fontSize = '2.8em';
          } else if(str.length < 75) {
            fontSize = '2.4em';
          } else if(str.length < 110) {
            fontSize = '2em';
          } else if(str.length < 150) {
            fontSize = '1.8em';
          } else if(str.length < 220) {
            fontSize = '1.6em';
          } else if(str.length < 350) {
            fontSize = '1.4em';
          } else if(str.length < 450) {
            fontSize = '1.2em';
          }
          jQuery(element).css({
            'font-size': fontSize
          });
        }, 100);
      }
    }
  }
])

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
