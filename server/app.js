var express = require('express');
var cors = require('cors');
var router = require('./router');
var bodyparser = require('body-parser');
var app = express();

// console.log(process.env);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(__dirname));

app.use('/router', router);
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.get('/home', function(req, res) {
    if (request.session.loggedin) {
		res.render('index.html');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.get('/', function(request, response) {
	response.render('/login.html');
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});
