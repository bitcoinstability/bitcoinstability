app.controller('HomeController', function($scope){
    $scope.expression = 'Stability(T) = {\\sqrt{\\frac{1}{N} \\sum_{i=T-N}^{T} (x_i - \\overline{x})^2}}^{-1}';
    $scope.getLaTeX = function(input){
        return input.toString();
    };
});

app.controller('StabilityController', function($scope, $http){
    
    var chart;
    
    $scope.startDate = new Date(2013, 0, 1);
    $scope.endDate = new Date();
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.options = {
        animation: false,
        showTooltips: false,
        pointDot: false,
        datasetStrokeWidth: 0.5,
        scaleShowGridLines: false,
        bezierCurve : false,
        
        showScale: true,
        // Boolean - If we want to override with a hard coded scale
        scaleOverride: true,

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: 13,
        // Number - The value jump in the hard coded scale
        scaleStepWidth: 100,
        // Number - The scale starting value
        scaleStartValue: 0,
    };
    
    $scope.datePickerOptions = {
        initDate: new Date(2011, 0, 1)
    };
    
    $scope.openStartDate = function($event){
        $event.preventDefault();
        $event.stopPropagation();

        $scope.startDateOpened = true;  
    }
    $scope.openEndDate = function($event){
        $event.preventDefault();
        $event.stopPropagation();

        $scope.endDateOpened = true;  
    }
    
    var renderChart = function(data){
        var options = {
            // fancy stuff turned off
            animation: false,
            bezierCurve : false,
            showTooltips: false,
            pointDot: false,
            scaleShowGridLines: false,

            // manually set scale
            showScale: true,
            scaleOverride: true,
            scaleSteps: 13,
            scaleStepWidth: 100,
            scaleStartValue: 0,
        };
        
        var element = document.getElementById('chart').getContext("2d");
        
        // Fix for ChartJS resizing the canvas element by applying a device-resolution-derived scaling factor
        if(!element.canvas.originalwidth) element.canvas.originalwidth = element.canvas.width;
        if(!element.canvas.originalheight) element.canvas.originalheight = element.canvas.height;

        element.canvas.width = element.canvas.originalwidth;
        element.canvas.height = element.canvas.originalheight;
        
        return new Chart( element ).Line(data, options);
        
    };
    
    var getStability = function( prices ){
        // Find average log(price) in array
        var average = 0;
        for( var i in prices ){
            average += Math.log(prices[i]);
        }
        average /= prices.length;
        
        // Find standard deviation of last N values given the average price
        var sumSquredDifferences = 0;
        for( var i in prices ){
            var price = Math.log(prices[i]);
            sumSquredDifferences+= Math.pow( average - price, 2);
        }

        var standardDeviation = Math.sqrt( 1 / prices.length * sumSquredDifferences );

        var stability = 1 / standardDeviation;

        return stability;
    }
    
    var calculateStabilities = function( priceData, timeframes ){
        var collectedSeries = {};
        
        for( var i in timeframes ){
            var seriesName = timeframes[i].toString();
            collectedSeries[ seriesName ] = [];
        }
        
        var stabilityData = [];
        
        for( var i=0; i<priceData.length; i++){

            for( var j in timeframes ){
                var seriesName = timeframes[j].toString();
                var seriesPointCount = timeframes[j];
                if( i < seriesPointCount ){
                    collectedSeries[ seriesName ].push(0);
                } else {
                    var stability = getStability( priceData.slice( i-seriesPointCount, i));
                    collectedSeries[ seriesName ].push( 4 * stability );
                }
            }
        }
            
        return collectedSeries;
    }
    
    var processData = function(marketData){
        
        // Remove previous chart
        if( chart ){
            chart.destroy();
            chart = undefined;
        }
        
        var dates = Object.keys(marketData.bpi);
        var prices = [];
        
        for( var i in dates ){
            prices.push( marketData.bpi[dates[i]] );
        }
        
        var chartData = {
            labels: [],
            datasets: []
        };
        
        
        // Add Labels
        // Don't show all the labels because the graph gets too crowded
        var axisLimit = 50;
        var step;
        if( dates.length < axisLimit ){
            step = 1;
        } else {
            step = Math.floor(dates.length/axisLimit);
        }

        for( var i=0; i<dates.length; i++){
            if( i % step == 0){
                chartData.labels.push( dates[i] );
            } else {
                chartData.labels.push('');
            }
        }
        
        /////////////////////////////////
        // STABILITY CALCULATIONS
        // TODO: GET FROM /u/AZOP!
        // CURRENT: (stddev of last 6 values) ^ -1
        /////////////////////////////////     
        var timeframes = [10, 14, 21, 31, 90];
        var series = calculateStabilities(prices, timeframes);
              
        ////////////////////////////////       
        // END STABILITY CALCULATIONS
        ////////////////////////////////       
        
        var blue = 'hsla(212,100%,40%,0.5)'; // Excel-blue #4F81BC
        var orange = 'hsla(27,91%,62%,1.0)'; // Excel=orange #F69547
        var clear = 'hsla(0, 0%, 0%, 0.0)';
        
        var colors = {
            '10': '#9ABA5B',
            '14': '#8064A1',
            '21': '#F69547',
            '31': '#762B29',
            '90': '#5E7431'
        };
        
        chartData.datasets.push( {
            label : 'Market Price ($)',
            pointColor: blue,
            pointStrokeColor: blue,
            pointHighlightFill: blue,
            pointHighlightStroke: blue,
            fillColor : clear,
            strokeColor : blue,
            highlightFill : blue,
            highlightStroke : blue,
            datasetStrokeWidth: 0.5,
            data : prices
        });
        
        for( var i in timeframes ){
            var seriesName = timeframes[i].toString();
        
        
            chartData.datasets.push( {
                label : 'Stability',
                pointColor: clear,
                pointStrokeColor: clear,
                pointHighlightFill: clear,
                pointHighlightStroke: clear,
                fillColor : clear,
                strokeColor : colors[seriesName],
                highlightFill : clear,
                highlightStroke : clear,
                datasetStrokeWidth: 2,
                data : series[seriesName]
            });
        }
        
        chart = renderChart(chartData);
    };
    
    $scope.fetchData = function(){
    
        function getFormattedDate(date){
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var day = date.getDate();
            
            if( month < 10 ){
                month = '0' + month;
            }
            
            if( day < 10 ){
                day = '0' + day;
            }
            
            return year + '-' + month + '-' + day;
        }
        
        var start = getFormattedDate( $scope.startDate );
        var end = getFormattedDate( $scope.endDate );

        var url = 'http://api.coindesk.com/v1/bpi/historical/close.json?start='+start+'&end='+end;

        $http.get(url).success( processData );
    }
    
    $scope.fetchData();
});