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
    
    //blue: #4F81BC
    //orange: #F69547
    
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
            datasetStrokeWidth: 0.5,
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
        
        var hue = 212; // excel-blue
        
        chartData.datasets.push( {
            label : 'Market Price ($)',
            pointColor: 'hsla(' + hue + ',100%,40%,0.5)',
            pointStrokeColor: 'hsla(' + hue + ',100%,40%,0.5)',
            pointHighlightFill: 'hsla(' + hue + ',100%,40%,0.5)',
            pointHighlightStroke: 'hsla(' + hue + ',100%,40%,0.5)',
            fillColor : 'hsla(' + hue + ',100%,40%,0.5)',
            strokeColor : 'hsla(' + hue + ',100%,40%,0.5)',
            highlightFill : 'hsla(' + hue + ',100%,20%,0.5)',
            highlightStroke : 'hsla(' + hue + ',100%,20%,0.5)',
            data : prices
        });
        
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