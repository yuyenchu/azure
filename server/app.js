var express = require('express');
var session = require('express-session');
// var cors = require('cors');
var path = require('path');
var router = require('./router');
var bodyparser = require('body-parser');
var app = express();

// console.log(process.env);
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/router', router);

app.get('/', function(req, res) {
    if (req.session.loggedin) {
        res.redirect('/home');
	} else {
        res.redirect('/login');
	}
});

app.get('/home', function(req, res) {
    if (req.session.loggedin) {
        res.render('pages/index',{username:"andrew"});
	} else {
        res.send('Please login to view this page!');
	}
});
app.get('/login', function(req, res) {
    res.render('pages/login',{username:""});
});

app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		// connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		// 	if (results.length > 0) {
		// 		request.session.loggedin = true;
		// 		request.session.username = username;
		// 		response.redirect('/home');
		// 	} else {
		// 		response.send('Incorrect Username and/or Password!');
		// 	}			
		// 	response.end();
        // });
        if (username=="andrew" && password=="andrew") {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/home');
        }
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});
