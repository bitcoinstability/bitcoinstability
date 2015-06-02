app.provider('PriceProvider', function(){
    
    var dates = [];
    var prices = [];
    var stabilities = {};
    
    ////////////////////////////
    // Until ChartJS adds multi-y-axis graphing, we scale the output ourselves
    ////////////////////////////
    var scaleFactor = 1;
    
    
    
    return {
        $get: function($http, $q){
            return {
                fetchPriceData: function(startDate, endDate){

                    var deferred = $q.defer();

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

                    var start = getFormattedDate(startDate );
                    var end = getFormattedDate( endDate );

                    var url = 'http://api.coindesk.com/v1/bpi/historical/close.json?start='+start+'&end='+end;

                    $http.get(url).then( function(response){

                        dates = Object.keys(response.data.bpi);

                        prices = [];
                        for( var i in dates ){
                            prices.push( response.data.bpi[ dates[i] ] );
                        }

                        deferred.resolve();
                    }, function(){
                        var message = 'failed to get data from coindesk';
                        deferred.reject(message);
                    });

                    return deferred.promise;
                },

                getPrices: function(){
                    return prices;
                },

                getDates: function(){
                    return dates;
                },

                calculateStabilityOfSet: function( prices ){
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

                    return stability * scaleFactor;
                },

                calculateStabilitySeries: function( numberOfDays ){
                    var deferred = $q.defer();

                    setTimeout( angular.bind(this, function(){

                        var stabilitySeries = [];

                        for( var i in prices ){
                            var price = prices[i];

                            if( i >= numberOfDays ){
                                var priceSubset = prices.slice( i-numberOfDays, i )
                                var stability = this.calculateStabilityOfSet( priceSubset );
                                stabilitySeries.push(stability);
                            } else {
                                stabilitySeries.push(NaN);
                            }
                        }

                        var returnData = {
                            data: stabilitySeries,
                            name: numberOfDays.toString() + '-Day Stability'
                        };

                        deferred.resolve(returnData);

                    }), Math.floor(Math.random()*100));

                    return deferred.promise;
                }
            };
        }
    };
});