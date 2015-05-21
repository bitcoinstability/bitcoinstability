var express = require('express');
var bodyParser = require('body-parser');

var server = express();
server.use(bodyParser.json());

server.get('/hello', function(req, res){
    res.status(200).send('Hello, World!');
});


var port = 81;

console.log('Server is running on port ' + port);

server.listen( port );