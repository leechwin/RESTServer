var express = require('express');
var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var db = require('mongojs').connect('rest', ['users', 'markers']);

app.use(logger());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
//app.use(express.session());
//app.use(expreess.static('public'))

/*
 * Create user
  */
app.post('/users', function(request, response) {
    var email = request.body.email;
    var password = request.body.password;
    console.log(email)
    console.log(password)
    if (email && password) {
        // find duplicated user
        db.users.findOne({
            email: email
        }, function (error, result) {
                if (result) {
                    response.send(409);
                } else {
                    db.users.insert({
                        email: email,
                        password: password,
                        markers: []
                    }, function (error, result) {
                        if (error) {
                            response.send(500);
                        } else {
                            response.send(result);
                        }
                    });
                }
            }
        );
    } else {
        response.send(400);
    }
});

/*
 * Login
 */
app.post('/users/login', function(request, response) {
    var email = request.body.email;
    var password = request.body.password;
    if (email && password) {
        // find duplicated user
        db.users.findOne({
                email: email
            }, function (error, result) {
                if (result) {
                    if (password === result.password) {
                        response.send({message: 'login success'}, 200);
                    } else {
                        response.send({message: 'invalid pasword'}, 400);
                    }
                } else {
                    response.send(409);
                }
            }
        );
    } else {
        response.send(400);
    }
});

/*
 * Find all user
 */
app.get('/users', function(request, response) {
    db.users.find(function (error, results) {
        response.jsonp(results);
    });
});

/*
 * Find user
 */
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

/*
 * Find all marker
 */
app.get('/markers', function(request, response) {
    db.markers.find(function (error, results) {
		//response.writeHead(200, { 'Content-Type': 'application/json' }); 
        response.jsonp(results);
    });
});

/*
 * Find marker
 */
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