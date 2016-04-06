angular.module('rastrodelama')

.filter('byTeam', [
  function() {

    var teams = {
      core: [
        8194785, // miguel peixe
        53490873, // helena wolfenson
        165708632, // aline lata
        201010328 // adriana barbosa
      ],
      guests: [

      ]
    };

    return _.memoize(function(input, team) {
      if(team) {
        input = _.filter(input, function(item) {
          return teams[team].indexOf(item.from.id) != -1;
        });
      }
      return input;
    }, function() {
      return JSON.stringify(arguments[0]) + arguments[1];
    });

  }
])

.filter('parseUrl', [
  function() {

    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;

    return function(text) {
      if(text) {
        text = text.replace(urlPattern, '<a target="_blank" href="$&">$&</a>');
      }
      return text;
    };
  }
])

.filter('autop', [
  function() {
    return function(input) {
      if(input) {
        input = '<p>' + input.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br />') + '</p>';
      }
      return input;
    }
  }
])

.filter('trustHtml', [
  '$sce',
  function($sce) {
    return function(input) {
      if(input)
        return $sce.trustAsHtml(input);
      else
        return input;
    }
  }
])

.filter('fromNow', [
  function() {
    return _.memoize(function(input) {
      return moment(input).tz(moment.tz.guess()).fromNow();
    });
  }
])

.filter('formatDate', [
  function() {
    return _.memoize(function(input, format) {
      return moment(input).tz(moment.tz.guess()).format(format);
    }, function() {
      return arguments[0] + arguments[1];
    });
  }
]);
