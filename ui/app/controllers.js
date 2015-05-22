app.controller('StabilityController', function($scope, $http){
    
    var start = '2012-01-01';
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1;
    
    if( month < 10 ){
        month = '0' + month;
    }
    
    var day = today.getDate();
    
    if( day < 10 ){
        day = '0' + day;
    }
    
    var end = year + '-' + month + '-' + day;
    
    var url = 'http://localhost/pricedata?start=' + start + '&end=' + end;
    
    $http.get(url).success( function(data){
        var labels = [];
        var values = [];
        
        var step = 10;
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
    });
});