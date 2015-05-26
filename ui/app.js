var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise("/home");
    
    $stateProvider.state('home', {
        url: "/home",
        templateUrl: "app/home/home.html",
        controller: 'HomeController'
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


// LaTeX directive and info from 
// http://stackoverflow.com/questions/16087146/getting-mathjax-to-update-after-changes-to-angularjs-model?rq=1
MathJax.Hub.Config({
    skipStartupTypeset: true,
    messageStyle: "none",
    "HTML-CSS": {
        showMathMenu: false
    }
});
MathJax.Hub.Configured();

app.directive("mathjaxBind", function() {
    return {
        restrict: "A",
        controller: ["$scope", "$element", "$attrs",
                function($scope, $element, $attrs) {
            $scope.$watch($attrs.mathjaxBind, function(texExpression) {
                var texScript = angular.element("<script type='math/tex'>")
                    .html(texExpression ? texExpression :  "");
                $element.html("");
                $element.append(texScript);
                MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
            });
        }]
    };
});
