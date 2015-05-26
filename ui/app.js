var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/home");
    
    $stateProvider.state('home', {
        url: "/home",
        templateUrl: "app/home/home.html"
    }).state('stability', {
        url: "/stability",
        templateUrl: "app/stability/stability.html",
        controller: 'StabilityController'
    });
    
});

app.directive('header', function(){
    return {
        templateUrl: 'app/header/header.html'
    };
});
