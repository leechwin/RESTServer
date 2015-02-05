var express = require('express');
var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

var db = require('mongojs').connect('rest', ['users', 'markers']);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});
 
//app.use(express.session());
//app.use(expreess.static('public'))

/**
 * STATUS CODE
 * 200: OK
 * 201: Created
 * 400: Bad Request
 * 401: Unauthorized
 * 404: Not Found
 * 409: Conflict
 * 500: Internal Server Error
 * 503: Service Unavailable
 */

/**
 * Create user
 * @param email
 * @param password
 */
app.post('/users', function(request, response) {
    console.log('[POST] /users');
    var email = request.body.email;
    var password = request.body.password;
    console.log('email: '+ email + ' password: ' + password);

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

/**
 * Login
 * @param email
 * @param password
 */
app.post('/users/login', function(request, response) {
    console.log('[POST] /users/login');
    var email = request.body.email;
    var password = request.body.password;
    console.log('email: '+ email + ' password: ' + password);

    if (email && password) {
        // find duplicated user
        db.users.findOne({
                email: email
            }, function (error, result) {
                if (result) {
                    if (password === result.password) {
                        // TODO:: login logic
                        response.send(200);
                    } else {
                        response.send(401);
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

/**
 * Find all user
 */
app.get('/users', function(request, response) {
    db.users.find(function (error, results) {
        response.jsonp(results);
    });
});

/**
 * Login
 * @param email
 * @Deprecated
 */
app.get('/users/:email', function(request, response) {
    db.users.findOne({
        email: request.params.email
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.jsonp(results);
        }
    });
});



/**
 * Create marker
 * @param coordinate
 * @param description
 * @param comment
 * @param score
 * @param category
 * @param author
 */
// TODO:: Added validation
app.post('/markers', function(request, response) {
    var data = request.body;
    console.log(data.coordinate)
    if (data.coordinate) {
        // find duplicated marker
        var id = data.coordinate.x + '-' + data.coordinate.y;
        db.markers.findOne({
                _id: id
            }, function (error, result) {
                if (result) {
                    response.send(409);
                } else {
                    db.markers.insert({
                        _id: id,
                        coordinate: data.coordinate,
                        description: data.description,
                        comment: data.comment,
                        score: data.score,
                        category: data.category,
                        author: data.author,
                        temp: ""
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

/**
 * Update marker comment
 * @param _id
 * @param comment
 */
app.post('/markers/comment', function(request, response) {
    var data = request.body;
    if (data._id) {
        // find and update
        db.markers.findOne({
                _id: data._id
            }, function (error, result) {
                if (result) {
                    var comments = result.comment;
                    comments.push(data.comment);

                    db.markers.update({
                        _id: data._id
                    }, {
                         $set: {
                            comment: comments
                        }
                    }, function (error, result) {
                         if (result) {
                             response.send(result);
                         } else {
                             response.send(500);
                         }
                     });
                } else {
                    response.send(500);
                }
            }
        );
    } else {
        response.send(400);
    }
});

/**
 * Update score
 * @param _id
 * @param score
 */
app.post('/markers/score', function(request, response) {
    var data = request.body;
    if (data._id) {
        // find and update
        db.markers.findOne({
                _id: data._id
            }, function (error, result) {
                if (result) {
                    var scores = result.score;
                    scores.push(data.score);

                    db.markers.update({
                        _id: data._id
                    }, {
                         $set: {
                            score: scores
                        }
                    }, function (error, result) {
                         if (result) {
                             response.send(result);
                         } else {
                             response.send(500);
                         }
                     });
                } else {
                    response.send(500);
                }
            }
        );
    } else {
        response.send(400);
    }
});

/**
 * Find all marker
 */
app.get('/markers', function(request, response) {
    db.markers.find(function (error, results) {
        response.jsonp(results);
    });
});

/**
 * Find all marker
 * @Deprecated
 */
app.get('/markers/:id', function(request, response) {
    db.markers.findOne({
        _id: request.param('id') // FIXME::
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.jsonp(results);
        }
    });
});

/**
 * Delete marker
 * @param id
 */
app.delete('/markers', function(request, response) {
    console.log(request.body);
    console.log(request.body._id);
    db.markers.remove({
        _id: request.body._id
    }, function (error, results) {
        if (error) {
            response.send(500);
        } else {
            response.send(results);
        }
    });
});

http.createServer(app).listen(3000, function() {
    console.log('Express server listening on port 3000');
});