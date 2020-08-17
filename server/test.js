var express = require('express');
var session = require('express-session');
var path = require('path');
var cors = require('cors');
var bodyparser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// declare config file path
const PORT = 3000;

var loggedinUsers = {}; // record accounts login 
// keep track of all devices' status and twin 
// then inject into home page before render
// in form of {id: data}


// set static directory
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
// app.use(express.static(path.join(__dirname, '/public')));
// setting express session for user login/logout
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// setting cache control to do not allow any disk cache 
// to prevent reload page without login
// pre: res != null
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
});
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});

app.route('/view/:id')
.post(function (req, res) {
    res.status(200).send(req.params.id+" post ok");
})
.delete(function (req, res) {
    res.status(200).send(req.params.id+" delete ok");
});

app.post('/device/:id/:ieEdge', function (req, res) {
    res.status(200).send(req.params.id+", "+req.params.ieEdge+" ok");
});
app.get('/initialize', function (req, res) {
    res.status(200).json({  "devices":{
                                "simulate2":{"state":"Disconnected"},
                                "simulate1":{"state":"Connected"}
                            },
                            "user":"Andrew", 
                            "twins":{
                                "simulate2":{"properties":{"reported":{"general":{"thingsproVersion": "1.1.0"}}}},
                                "simulate1":{"properties":{"reported":{"general":{"thingsproVersion": "2.0.1"}}}}
                            }});
});
// send loggedin 
// pre: loggedin != null
// post: send loggedin to res
app.get('/users', function (req, res) {res.json(loggedinUsers)});

// start server
// pre: config valid
server.listen(PORT, function () {
    console.log('app listening on port '+PORT+'!');
});