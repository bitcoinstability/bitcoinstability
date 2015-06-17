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
    $scope.chartScale = 'linear';

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
    
    $scope.prices = {};
    
    $scope.series = [];
    
    function scaleData(array){
        for( var i in array ){
            array[i] *= scaleFactor;
        }
        return array;
    }

    var prepareChartData = function (labels, priceData, stabilitySeries) {
        
        $scope.prices = {
            name: 'Bitcoin Price',
            data: priceData,
            startDate: $scope.startDate
        };
        
        var newStabilitySeries = [];
        
        for( var i in stabilitySeries ){
            var s = stabilitySeries[i];
            s.startDate = $scope.startDate;
            newStabilitySeries.push( s );
        }
        
        $scope.series = newStabilitySeries;
    };

    $scope.addStabilitySeries = function (numberOfDays) {

        PriceProvider.calculateStabilitySeries(numberOfDays).then(function (series) {

            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData, [series]);
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
            var chartData = prepareChartData(labels, priceData, seriesArray);
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
            var chartData = prepareChartData(labels, priceData, [weightedSeries]);
        });
        
    };

    $scope.fetchData = function () {
        var deferred = $q.defer();
        
        PriceProvider.fetchPriceData($scope.startDate, $scope.endDate).then(function () {

            var priceData = PriceProvider.getPrices();
            var labels = PriceProvider.getDates();
            var chartData = prepareChartData(labels, priceData);

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