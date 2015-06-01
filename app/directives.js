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
            
            var formatData = function(prices, series){
                var returnedSeries = [{
                    type: 'line',
                    name: 'Bitcoin Price',
                    data: prices,
                    color: 'black',
                    pointStart: Date.UTC(2010, 0, 1),
                    pointInterval: 24 * 3600 * 1000 // one day
                }];
                
                for( var i in series ){
                    var hue = Math.floor((i * 137.5 + 207) % 360);
                    
                    returnedSeries.push( {
                        type: 'line',
                        name: 'Bitcoin Price',
                        data: series[i],
                        color: 'hsla(' + hue + ',100%,40%,0.5)',
                        pointStart: Date.UTC(2010, 0, 1),
                        pointInterval: 24 * 3600 * 1000 // one day
                    });
                }
                
                return returnedSeries;
            };

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: element[0].id,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: 'Bitcoin Price Stability'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>',
                    percentageDecimals: 1
                },
                plotOptions: {
                    /*pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function () {
                                return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
                            }
                        }
                    }*/
                },
                xAxis: {
                    type: 'datetime',
                    units: [
                        [
                            'day',
                            [1]
                        ]
                    ]
                },
                series: formatData(scope.prices, scope.series)
            });
            
            scope.$watch("prices", function (newValue) {
                var newData = formatData(newValue, scope.series);
                chart.series[0].setData(newData, true);
            }, true);
            scope.$watch("series", function (newValue) {
                var newData = formatData(scope.price, newValue);
                chart.series[0].setData(newData, true);
            }, true);

        }
    };
});