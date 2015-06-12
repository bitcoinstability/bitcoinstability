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
                    yAxis: 1,
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
                        yAxis: 0,
                        pointStart: s.startDate.getTime(),
                        pointInterval: 24*3600*1000
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
                    text: 'Bitcoin Price and Stability'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>'
                },
                plotOptions: {},
                xAxis: {
                    type: 'datetime',
                    title: 'Date',
                    units: [
                        [
                            'day',
                            [1]
                        ],
                        [
                            'month',
                            [1, 3, 6]
                        ]
                    ]
                },
                yAxis: [{ // Primary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Stability',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    floor: 0,
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true


                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: 'Bitcoin Price',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    floor: 0,
                    labels: {
                        format: '${value}',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }],
                series: [{}, {}]
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
                
                if( !newValue || !newValue.length ){ return; }
                
                var newSeries = formatSeries(newValue);
                
                // Remove all series except for the price
                while( chart.series.length > 1 ) { 
                    chart.series[1].remove( false );
                }
                
                for( var i in newSeries ){
                    var s = newSeries[i];
                    chart.addSeries( s, false );
                }
                
                chart.redraw();
                
            }, true);

        }
    };
});