'use strict';

angular.module('cloudImagesUiApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from outer templates domain.
      'http://2af38e52cc241f806fef-6257090f8b77658659ee2c55c0d9059e.r10.cf1.rackcdn.com/**'
    ]);
    $routeProvider
      .when('/', {
        // templateUrl: 'http://2af38e52cc241f806fef-6257090f8b77658659ee2c55c0d9059e.r10.cf1.rackcdn.com/0.6/views/main.html', // SOON. TODO - make this work with some sort of grunt task
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
