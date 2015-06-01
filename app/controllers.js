app.controller('HomeController', function ($scope) {
    $scope.expression = 'Stability(T) = {\\sqrt{\\frac{1}{N} \\sum_{i=T-N}^{T} (x_i - \\overline{x})^2}}^{-1}';
    $scope.getLaTeX = function (input) {
        return input.toString();
    };
});

app.controller('StabilityController', function ($scope, PriceProvider, $q) {

    var chart;
    var scaleFactor = 6;

    $scope.startDate = new Date(2013, 0, 1);
    $scope.endDate = new Date();
    $scope.stabilitySeries = 'weighted';

    $scope.datePickerOptions = {
        initDate: new Date(2011, 0, 1)
    };

    $scope.openStartDate = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.startDateOpened = true;
    };
    
    $scope.openEndDate = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.endDateOpened = true;
    };
    
    $scope.prices = [
        13, 36, 1200, 600, 250, 200
    ];
    $scope.series = [
        [1, 4, 3, 2, 4, 3],
        [8, 2, 5, 4, 2, 6],
        [9, 1, 3, 5, 2, 6]
    ];

    var renderChart = function (data) {

        // Remove previous chart
        /*if (chart) {
            chart.destroy();
            chart = undefined;
        }

        var options = {
            // fancy stuff turned off
            animation: false,
            bezierCurve: false,
            showTooltips: false,
            pointDot: false,
            scaleShowGridLines: false,

            // manually set scale
            showScale: true,
            scaleOverride: true,
            scaleSteps: 13,
            scaleStepWidth: 100,
            scaleStartValue: 0,
            legendTemplate: '<% for (var i=0; i<datasets.length; i++){%><span class="chartLabel"><i style=\"color:<%=datasets[i].strokeColor%>\" class="fa fa-line-chart"></i><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>'
        };

        var element = document.getElementById('chart').getContext("2d");

        // Fix for ChartJS resizing the canvas element by applying a device-resolution-derived scaling factor
        if (!element.canvas.originalwidth) element.canvas.originalwidth = element.canvas.width;
        if (!element.canvas.originalheight) element.canvas.originalheight = element.canvas.height;

        element.canvas.width = element.canvas.originalwidth;
        element.canvas.height = element.canvas.originalheight;

        chart = new Chart(element).Line(data, options);
        document.getElementById('chartLegend').innerHTML = chart.generateLegend();*/
        
        /*var container = document.createElement('div');
        document.body.appendChild(container);
        
        var options = {
            renderTo: container,
            title: {
                text: 'Chart reflow is set to true'
            },

            subtitle: {
                text: 'When resizing the window or the frame, the chart should resize'
            },


            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },

            series: [{
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
            }]
        };
        
        var chart2 = new Highcharts.Chart(options);*/

    };
    
    function scaleData(array){
        for( var i in array ){
            array[i] *= scaleFactor;
        }
        return array;
    }

    var prepareChartData = function (labels, priceData, stabilitySeries) {

        var chartData = {
            labels: [],
            datasets: []
        };

        // Add Labels
        // Don't show all the labels because the graph gets too crowded
        var axisLimit = 50;
        var step;
        if (labels.length < axisLimit) {
            step = 1;
        } else {
            step = Math.floor(labels.length / axisLimit);
        }

        for (var i = 0; i < labels.length; i++) {
            if (i % step == 0) {
                chartData.labels.push(labels[i]);
            } else {
                chartData.labels.push('');
            }
        }    

        var blue = 'hsla(212,2%,40%,1.0)'; // Excel-blue #4F81BC
        var clear = 'hsla(0, 0%, 0%, 0.0)';

        // Render price data if available
        if (priceData) {
            chartData.datasets.push({
                label: 'Market Price ($)',
                pointColor: blue,
                pointStrokeColor: blue,
                pointHighlightFill: blue,
                pointHighlightStroke: blue,
                fillColor: clear,
                strokeColor: blue,
                highlightFill: blue,
                highlightStroke: blue,
                datasetStrokeWidth: 0.5,
                data: priceData
            });
        }

        // Render stability series if they are available
        if (stabilitySeries) {

            for (var i in stabilitySeries) {
                var name = stabilitySeries[i].name;
                var data = stabilitySeries[i].data;

                var hue = Math.floor((i * 137.5 + 207) % 360);

                chartData.datasets.push({
                    label: name,
                    pointColor: clear,
                    pointStrokeColor: clear,
                    pointHighlightFill: clear,
                    pointHighlightStroke: clear,
                    fillColor: clear,
                    strokeColor: 'hsla(' + hue + ',100%,40%,0.5)',
                    highlightFill: clear,
                    highlightStroke: clear,
                    datasetStrokeWidth: 2,
                    data: scaleData(data)
                });
            }
        }

        return chartData;
    };

    $scope.addStabilitySeries = function (numberOfDays) {

        PriceProvider.calculateStabilitySeries(numberOfDays).then(function (series) {

            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData, [series])
            renderChart(chartData);
        });

    };
    
    $scope.showDefaultStabilitySeries = function(){
        var days = [10, 14, 21, 30, 90];
        var promises = [];
        
        for( var i in days ){
            promises.push( PriceProvider.calculateStabilitySeries(days[i]));
        }
        
        $q.all(promises).then( function(seriesArray){
            
            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData, seriesArray)
            renderChart(chartData);
        });
        
    };
    
    $scope.showWeightedStabilitySeries = function(){
        var promises = [];
        var weightedSeries = {
            name: 'Weighted Stability',
            data: []
        };
        
        // Calculate stability series data for N=7 to 31
        for( var i=7; i<=31; i++ ){
            promises.push( PriceProvider.calculateStabilitySeries(i));
        }
        
        
        $q.all(promises).then( function(seriesArray){

            var numberOfDays = seriesArray[0].data.length;
            
            // Iterate for each day
            for( var i=0; i<numberOfDays; i++ ){
                
                var weightedAverage = 0;
                var divisor = 0;
                
                // Add weighted value to average
                for( var j=0; j<seriesArray.length; j++ ){
                    var series = seriesArray[j];
                    var value = series.data[i];
                    
                    // N = j+7
                    var weight = (j+7)*(j+7);
                    weightedAverage += value * weight;
                }
                
                // 7^2 + 8^2 + ... + 31^2                
                weightedAverage /= 10325 ;
                    
                weightedSeries.data.push(weightedAverage);
            }
            
            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData, [weightedSeries])
            renderChart(chartData);
        });
        
    };

    $scope.fetchData = function () {
        var deferred = $q.defer();
        
        PriceProvider.fetchPriceData($scope.startDate, $scope.endDate).then(function () {

            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData);
            renderChart(chartData);

            deferred.resolve();
        }, function (message) {
            deferred.reject();
            console.log(message);
        });
        
        return deferred.promise;
    };
    
    $scope.updateDataAndCharts = function(){
        $scope.fetchData().then( $scope.updateStabilityCharts );
    };

    $scope.updateStabilityCharts = function(){
        if( $scope.stabilitySeries === 'weighted' ){
            $scope.showWeightedStabilitySeries();
        } else {
            $scope.showDefaultStabilitySeries();   
        }
    };
    
    $scope.updateDataAndCharts();
    
});