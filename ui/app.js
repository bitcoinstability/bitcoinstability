var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'chart.js']);

app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/home");
    
    $stateProvider.state('home', {
        url: "/home",
        templateUrl: "app/home/home.html",
        controller: 'HomeController'
    }).state('stability', {
        url: "/stability",
        templateUrl: "app/stability/stability.html"
    });
    
});
