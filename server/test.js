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

// keep track of all devices' status and twin 
// then inject into home page before render
// in form of {id: data}


// io.on('connect', (socket) => {
//     console.log('a user connected');
//     // io.emit("Andrew",'a user connected');
//     io.emit("Andrew",{"state":{"body":{"simulate2":{"state":"Connected"}},"id":"simulate2"}});
  
//     socket.on("disconnect", () => {
//         console.log("a user go out");
//         // io.emit("Andrew","a user go out");
//         io.emit("Andrew",{"id":"simulate2","state":{"simulate2":{"state":"Disconnected"}}});
//     });
// });


// set static directory
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build')));
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

app.get('/', (req,res) =>{
    // res.redirect('/home');
    res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});

app.get('/home', (req,res) =>{
    console.log(path.join(__dirname+'/../client/build/index.html'));
    res.sendFile(path.join(__dirname+'/../client/build/index.html'));
    io.emit("Andrew",{"state":{"body":{"simulate2":{"state":"Connected"}},"id":"simulate2"}});
});

app.get('/manage', (req,res) =>{
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
                                "simulate2":{"properties":{"reported":{"general":{"thingsproVersion": "1.1.0"},"Name":"s2"}}},
                                "simulate1":{"properties":{"reported":{"general":{"thingsproVersion": "2.0.1"}}}}
                            }});
});
app.post('/method/:id/:name', function (req, res) {
    console.log("METHOD "+req.params.id+", "+req.params.name+"\n"+JSON.stringify(req.body))
    if (req.params.name==="message-policy-put") {
        res.status(200).json({"groups": [{"enable":req.body["groups"][0]["enable"],"outputTopic":"sys-test"},
                                        {"enable":req.body["groups"][1]["enable"],"outputTopic":"modbus-test"}]})
    } else if (req.params.name==="message-policy-get"){
        res.status(200).json({"groups": [{"enable":false,"outputTopic":"sys-test"},{"enable":false,"outputTopic":"modbus-test"}]})
    } else {
        res.status(200).send(req.params.id+", "+req.params.name+"\n"+JSON.stringify(req.body)+" ok");
    }
});
// send loggedin 
// pre: loggedin != null
// post: send loggedin to res
app.get('/users', function (req, res) {
    io.emit("Andrew",{"state":{"body":{"simulate2":{"state":"Connected"}},"id":"simulate2"}});
    res.send("ok");
});

app.get('/event', function (req, res) {
    io.emit("Andrew",{"event":""});
    res.send("ok");
}).post('/event/:val', function (req, res) {
    io.emit("Andrew",
    {
        "event":{
            "body":{
                "values":[
                    {"value":req.params.val,"updateTimeStamp":new Date().getTime()},
                    {"value": 30,"updateTimeStamp":new Date().getTime()+1}
                ]
            },
            "id":"simulate2"
        }
    });
    res.send("ok");
});

// start server
// pre: config valid
server.listen(PORT, function () {
    console.log('app listening on port '+PORT+'!');
});