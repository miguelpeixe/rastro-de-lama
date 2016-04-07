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

          $element.append('<div class="timeline-content"></div>');

          var $container = jQuery($element).find('.timeline-content');

          var dayHeader = '<header><h2>{{formattedDate}}</h2></header>';

          var itemTemplate = '<message class="timeline-item" data="item"></message>';

          var itemsPerDay;

          var windowWidth = $(window).width();

          var itemCache = {};

          $scope.$watch('items', _.throttle(function(items) {

            windowWidth = $(window).width();

            itemsPerDay = getItemsPerDay(items);

            $container.height($container.height());
            $container.empty();

            if(items && items.length) {
              for(var day in itemsPerDay) {
                $container.append(buildDay(day, itemsPerDay));
              }
            }
            $container.height('auto');
          }, true), 250);

          var prevSize = false;
          $(window).resize(function() {
            var width = $(window).width();
            if(!prevSize)
              prevSize = $(window).width();
            if(
              (width >= 900 && prevSize < 900) ||
              (width < 900 && prevSize >= 900)
              ) {
              jQuery($element).empty();
              for(var day in itemsPerDay) {
                $element.append(buildDay(day, itemsPerDay));
              }
            }
            prevSize = $(window).width();
          });

          function getItemsPerDay(items) {
            if(items) {
              var itemsPerDay = {};
              items.forEach(function(item, i) {
                var date = moment(item.date*1000);

                var day;
                if(date.isSame(moment(), 'day')) {
                  day = 'Hoje';
                } else {
                  day = date.format('DD/MM/YYYY');
                }
                if(!itemsPerDay[day])
                  itemsPerDay[day] = [];
                itemsPerDay[day].push(item);
              });
            }
            return itemsPerDay;
          }

          function buildDay(day, items) {
            if(!itemCache[day]) {
              var dayScope = $scope.$new(false, $scope.$parent);
              dayScope.formattedDate = day;
              itemCache[day] = $compile('<section class="timeline-day clearfix">' + dayHeader + '<div class="left-col"></div><div class="right-col"></div></section>')(dayScope);
            }
            items[day].forEach(function(item, i) {
              buildItem(itemCache[day], dayScope, item, i);
            });
            return itemCache[day];
          }

          function buildItem($container, dayScope, item, i) {
            var child = 'left-col';
            if(windowWidth >= 900) {
              if(i%2) child = 'right-col';
            }
            if(!itemCache[item.message_id]) {
              var itemScope = $scope.$new(false, dayScope);
              itemScope.item = item;
              itemCache[item.message_id] = $compile(itemTemplate)(itemScope);
            }
            $container.find('.' + child).append(itemCache[item.message_id]);
          }
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
            fontSize = '2.6em';
          } else if(str.length < 50) {
            fontSize = '2.4em';
          } else if(str.length < 75) {
            fontSize = '2.2em';
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
  'fbDatabase',
  '$firebaseObject',
  '$firebaseAuth',
  '$state',
  function(fbDatabase, $firebaseObject, $firebaseAuth, $state) {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        dateFormat: '@'
      },
      templateUrl: '/message.html',
      replace: true,
      link: function(scope, element, attrs) {

        var ref = new Firebase(fbDatabase);
        var messagesRef = ref.child('messages');
        var publicRef = ref.child('public_messages');

        scope.authObj = $firebaseAuth(ref);
        scope.$watch(function() {
          return scope.authObj.$getAuth();
        }, function(auth) {
          scope.user = auth;
        });

        scope.setPublic = function(item) {
          if(scope.user) {
            var newItem = _.clone(item);
            for(var key in newItem) {
              if(key.indexOf('$') == 0) {
                delete newItem[key];
              }
            }
            newItem.public = true;
            $firebaseObject(messagesRef.child(item.$id))
              .$loaded().then(function(data) {
                _.extend(data, { public: true }).$save();
              });
            $firebaseObject(publicRef.child(item.$id))
              .$loaded().then(function(data) {
                _.extend(data, newItem).$save();
              });
          }
        };

        scope.remove = function(item) {
          if(confirm('Você tem certeza?')) {
            $firebaseObject(publicRef.child(item.$id)).$remove();
            $firebaseObject(messagesRef.child(item.$id)).$remove();
          }
        }

        scope.setPrivate = function(item) {
          $firebaseObject(messagesRef.child(item.$id))
            .$loaded().then(function(data) {
              _.extend(data, { public: false }).$save();
            });
          $firebaseObject(publicRef.child(item.$id)).$remove();
        }

        scope.isToday = function(message) {
          return moment(message.date*1000).isSame(moment(), 'day');
        }

        scope.dateFormat = scope.dateFormat || 'relative';

        scope.isFull = function() {
          return scope.dateFormat == 'full';
        };

        scope.getUrl = function() {
          return encodeURIComponent($state.href('message', {id: scope.data.message_id}, {absolute: true}));
        };

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

.directive('messageMap', [
  '$compile',
  function($compile) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {

        var template = '<ui-gmap-google-map center="map.center" zoom="map.zoom" options="map.options"><ui-gmap-marker coords="map.marker" idkey="0"></ui-gmap-marker></ui-gmap-google-map>';

        scope.$watch('data.location', function(location) {
          var mapScope = scope.$new(true);
          mapScope.map = {
            center: _.clone(location),
            marker: _.clone(location),
            zoom: 16,
            options: {
              scrollwheel: false
            }
          };
          jQuery(element).empty().append($compile(template)(mapScope));
        });

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
