var express = require('express');
var session = require('express-session');
var path = require('path');
var router = require('./router');
var bodyparser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const request = require('request');
const { EventHubConsumerClient } = require("@azure/event-hubs");
const config = require('config');
const eh = config.get('eventhub');
const hub = config.get('hub');
const users = require('./config/user.json');

const consumerClient = new EventHubConsumerClient("$Default", eh["connectionstr"]);
console.log("connected")
const subscription = consumerClient.subscribe({
	processEvents: async (events, context) => {
		for (const event of events) {
			dateObj = new Date(event.systemProperties["iothub-enqueuedtime"]); 
			utcString = dateObj.toUTCString();
            io.emit('telemtry', JSON.stringify({"id":event.systemProperties['iothub-connection-device-id'],
                                                "time": utcString,"body": event.body
                                                }));
		}
	},
	processError: async (err, context) => {
		console.log(`Error : ${err}`);
	}
});

var devices = {};
const deviceUrl = 'https://'+hub.name+'.azure-devices.net/devices?api-version=2018-06-30'
function getDevices() {
    // console.log("looping")
    request.get({
        url: deviceUrl,
        headers: hub.head
    }, 	function(error,response,body){
            // console.log(body);
            // console.log("devices "+response.statusCode);
            var b = JSON.parse(body);
            b.forEach(element => {
                var id = element["deviceId"];
                if (!devices[id] || devices[id]["state"] != element["connectionState"]) {
                    devices[id]={"state":element["connectionState"], "lastActive":element["connectionStateUpdatedTime"]};
                    toSend={};
                    toSend[id]=devices[id];
                    io.emit('device', toSend);
                    console.log(id);
                }
            });
    });
    setTimeout(getDevices, 1000);
}

getDevices();

io.on('connection', function(socket) {
    console.log('a user connected');
    Object.keys(devices).forEach(element => {
        // toSend={};
        // toSend[element]=devices[element];
        io.emit('device', devices);
    });
});
// console.log(users["root"])
// console.log(users["root"].password)
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

// routing for CORS issue
app.use('/router', router);

// decide which page to go
app.get('/', function(req, res) {
    if (req.session.loggedin) {
        res.redirect('/home');
	} else {
        res.redirect('/login');
	}
});
// home page
app.get('/home', function(req, res) {
    if (req.session.loggedin) {
        res.render('pages/index_socket',{username:req.session.username, disable:""});
	} else {
        res.send('Please login to view this page!');
	}
});
// login page
app.get('/login', function(req, res) {
    res.render('pages/login',{username:"You haven't logged in", disable:"disabled",result:""});
});

// response to login submit
app.post('/auth', function(req, res) {
	var username = req.body.username.trim();
	var password = req.body.password.trim();
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
        // console.log(username==users[username])
        // console.log(password==users[username].password)
        if (users[username] && password==users[username].password) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/home');
        } else {
            res.render('pages/login',{username:"You haven't logged in", disable:"disabled",result:"Incorrect Username and/or Password!"});
            // res.send('Incorrect Username and/or Password!');
        }			
        res.end();
	} else {
        res.render('pages/login',{username:"You haven't logged in", disable:"disabled",result:"Please enter Username and Password!"});
		// res.send('Please enter Username and Password!');
		res.end();
	}
});

server.listen(3000, function () {
    console.log('app listening on port 3000!');
});
