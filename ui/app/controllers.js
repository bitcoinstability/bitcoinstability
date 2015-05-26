app.controller('StabilityController', function($scope, $http){
    
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

        $http.get(url).success( function(data){
            var labels = [];
            var priceValues = [];
            var stabilityValues = [];
            
            
            var keys = Object.keys(data.bpi);

            // Don't show all the labels because the graph gets too crowded
            var axisLimit = 50;
            var step;
            if( keys.length < axisLimit ){
                step = 1;
            } else {
                step = Math.floor(keys.length/axisLimit);
            }
            
            for( var i=0; i<keys.length; i++){
                if( i % step == 0){
                    labels.push( keys[i] );
                } else {
                    labels.push('');
                }
                
                var price = data.bpi[ keys[i] ];
                priceValues.push(price);
                
                if( i > 0 ){
                    var previousPrice = data.bpi[ keys[i-1] ];
                
                    stabilityValues.push( price/previousPrice );
                }
            }

            $scope.data = [priceValues];
            $scope.labels = labels;
            $scope.series = ['Price (USD)'];
        });
        
    }
    
    $scope.fetchData();
});