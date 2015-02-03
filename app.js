var express = require('express');
var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var db = require('mongojs').connect('rest', ['users', 'markers']);

app.use(logger());
app.use(bodyParser.json());
//app.use(express.session());
//app.use(expreess.static('public'))

/* login
app.post('/users', function(request, response) {
    db.users.insert({
        title: 'test'
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.send(results);
        }
    });
});
*/

app.get('/users', function(request, response) {
    db.users.find(function (error, results) {
        response.jsonp(results);
    });
});

app.get('/users/:user', function(request, response) {
    db.collection('users').findOne({
        email: request.param('user'),
        //password: request.param('pass')
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.jsonp(results);        
        }
    });
});


/*
app.post('/markers', function(request, response) {
    db.markers.insert({
        title: 'test'
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.send(results);
        }
    });
});
*/

app.get('/markers', function(request, response) {
    db.markers.find(function (error, results) {
		//response.writeHead(200, { 'Content-Type': 'application/json' }); 
        response.jsonp(results);
    });
});

app.get('/markers/:marker', function(request, response) {
    db.collection('markers').findOne({
        _id: request.param('marker'),
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.jsonp(results);        
        }
    });
});


http.createServer(app).listen(3000, function() {
    console.log('Express server listening on port 3000');
});