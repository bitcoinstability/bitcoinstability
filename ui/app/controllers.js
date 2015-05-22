app.controller('StabilityController', function($scope, $http){
    
    $scope.startDate = new Date(2011, 0, 1);
    $scope.endDate = new Date();
    
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

        var url = 'http://localhost/pricedata?start=' + start + '&end=' + end;

        $http.get(url).success( function(data){
            var labels = [];
            var values = [];

            // Don't show all the data unless there are less than N points
            var limit = 50;
            var step = Math.ceil(Object.keys(data.bpi).length / limit);
            
            var index = 0;
            for( var i in data.bpi ){
                if( index % step == 0){
                    labels.push(i);
                    values.push(data.bpi[i]);
                }
                index++;
            }

            $scope.data = [values];
            $scope.labels = labels;
            $scope.series = ['Price Data'];
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };
            $scope.options = {
                animation: false,
                showScale: true,
                showTooltips: false,
                pointDot: false,
                datasetStrokeWidth: 0.5
            };
        });
        
    }
    
    $scope.fetchData();
});