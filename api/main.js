var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var server = express();
console.log('dirname: ' + __dirname);
server.use(express.static(__dirname + '/../ui'));
server.use(bodyParser.json());

server.get('/pricedata', function(req, res){
    
    console.log('fetching price data');
    var start = req.query.start;
    var end = req.query.end;
    
    var url = 'http://api.coindesk.com/v1/bpi/historical/close.json?start=' + start + '&end=' + end;
    
    var options = {
        method: 'GET',
        url: url,
        json: true
    };
    
    request(options, function(error, response, body){
            
        if( error || !response || !response.statusCode ){
            console.log('error: ' + response.statusCode);
            res.status(500).send();
        }

        if (!error && response.statusCode == 200) {
            res.status(200).send(response.body);
        } else {
            console.log('error: ' + response.statusCode);
            res.status(response.statusCode).send(response.body);
        }

    });
    
});


var port = 80;

console.log('Server is running on port ' + port);

server.listen( port );