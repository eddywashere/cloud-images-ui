'use strict';

angular.module('cloudImagesUiApp')
  .controller('MainCtrl', function ($scope, $http, Servers) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.servers = [];

    Servers.get({region: 'ORD'}, function(data){
      $scope.servers = $scope.servers.concat(data.servers);
    });
    Servers.get({region: 'DFW'}, function(data) {
      $scope.servers = $scope.servers.concat(data.servers);
    });
    Servers.get({region: 'IAD'}, function(data) {
      $scope.servers = $scope.servers.concat(data.servers);
    });
  });
