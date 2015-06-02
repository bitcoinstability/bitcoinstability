app.directive('stabilityChart', function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            series: '=',
            prices: '='
        },
        controller: function ($scope, $element, $attrs) {
        },
        link: function (scope, element, attrs) {
            
            if( ! (scope.series && scope.prices) ){
                return;
            }
            
            var formatPrices = function(prices){
                return { 
                    type: 'line',
                    name: prices.name,
                    data: prices.data,
                    color: 'black',
                    pointStart: prices.startDate.getTime(),
                    pointInterval: 24*3600*1000
                };
            };
            
            var formatSeries = function(series){
                var returnedSeries = [];
                
                for( var i in series ){
                    var hue = Math.floor((i * 137.5 + 207) % 360);
                    
                    var s = series[i];
                    
                    returnedSeries.push( {
                        type: 'line',
                        name: s.name,
                        data: s.data,
                        color: 'hsla(' + hue + ',100%,40%,0.5)',
                        pointStart: s.startDate.getTime()
                    });
                }
                
                return returnedSeries;
            };
            
            //var joinedSeries = [formatPrices( scope.prices )].concat( formatSeries(scope.series));

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: element[0].id,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: 'Test Graph'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>'
                },
                plotOptions: {},
                xAxis: {
                    type: 'datetime',
                    title: 'Date',
                    //tickPixelInterval: 50,
                    //tickInterval: 24 * 3600 * 1000,
                    units: [
                        [
                            'month',
                            [1, 3, 6]
                        ]
                    ]
                },
                series: []
            });
            
            scope.$watch("prices", function (newValue) {
                if( !newValue.data ){ return; }
                
                // Remove all series
                while( chart.series.length > 0 ) { 
                    chart.series[0].remove( false );
                }
                
                var newSeries = formatPrices( newValue );
                chart.addSeries( newSeries );
            }, true);
            
            scope.$watch("series", function (newValue) {
                /*var newSeries = formatSeries(newValue);
                
                // Remove all series except for the price
                while( chart.series.length > 1 ) { 
                    chart.series[1].remove( false );
                }
                
                for( var i in newSeries ){
                    chart.addSeries( newSeries[i], false );
                }
                
                chart.redraw();*/
                
            }, true);

        }
    };
});