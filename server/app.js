var express = require('express');
var session = require('express-session');
var path = require('path');
var mysql = require('mysql');
var bodyparser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// declare config file path
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';
const config = require('config');
const request = require('request');
const { EventHubConsumerClient } = require("@azure/event-hubs");
const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus"); 
const { Registry } = require('azure-iothub');
const eh = config.get('eventhub');
const hub = config.get('hub');
const ms = config.get('mysql');
const sb = config.get('serviceBus');
const PORT = config.get('port');
const MAX_LISTEN = 10;
const LISTEN_INTERVAL = 1000;

var loggedinUsers = {};
var devices = {};
var twins = {};
var connection = mysql.createConnection({
    host     : ms.host,
	user     : ms.user,
	password : ms.password,
	database : ms.database
});

function getAllDevices() {
    request.get({
        url: 'https://'+hub.name+'.azure-devices.net/devices?api-version=2018-06-30',
        headers: hub.head
    }, 	function(error,response,body){
            if (error) {
                console.error(err.constructor.name + ': ' + err.message);
            } else {
                var b = JSON.parse(body);
                b.forEach(element => {
                    var id = element["deviceId"];
                    devices[id]={"state":element["connectionState"], "lastActive":element["connectionStateUpdatedTime"]};
                    console.log("device "+id);
                });
                getAllTwins();
            }
    });
}

const registry = Registry.fromConnectionString(hub.connectionstr);
function getAllTwins() {
    Object.keys(devices).forEach(element => {
        registry.getTwin(element, function(err, twin){
            if (err) {
                console.error(err.constructor.name + ': ' + err.message);
            } else {
                console.log("twin "+element);
                twins[element] = twin;
            }
        });
    });
}

function updateTwin(twinPath, data, key) {
    if (!twinPath[key] || typeof(data[key])!= "object"){
        twinPath[key] = data[key];
    } else {
        Object.keys(data[key]).forEach(element => {
            updateTwin(twinPath[key], data[key], element);
        });
    }
}

async function twinListener(receiver) {
    try {
        const messages = await receiver.receiveMessages(MAX_LISTEN);
        messages.forEach(msg => {
            var id = msg.userProperties.deviceId;
            console.log("twin queue "+id);
            if (msg.body["properties"]["reported"] && msg.body["properties"]["reported"]["Name"] &&
            msg.body["properties"]["reported"]["Name"] != twins[id]["properties"]["desired"]["Name"]) {
                const twinUrl = 'https://'+hub.name+'.azure-devices.net/twins/'+id+'?api-version=2020-03-13'
                request.patch({
                    url: twinUrl,
                    headers: hub.head,
                    json: {
                        "properties": {
                            "desired": {
                                    "Name": msg.body["properties"]["reported"]["Name"]
                            }
                        }
                    }
                }, 	function(error,response){
                    console.log("TwinUpdate to match report name "+response.statusCode);
                });
            } else {
                Object.keys(msg.body).forEach(key => {
                    updateTwin(twins[id], msg.body, key);
                });
                io.emit(id+"/twin",twins[id]);
            }
            msg.complete();
        });
    } catch(err) {
        console.log('Twin Error : '+err);
    }
    setTimeout(function() {twinListener(receiver);}, LISTEN_INTERVAL);
}

async function stateListener(receiver) {
    try {
        const messages = await receiver.receiveMessages(MAX_LISTEN);
        messages.forEach(msg => {
            var id = msg.body.data.deviceId;
            if(msg.body.eventType == "Microsoft.Devices.DeviceDisconnected"){
                devices[id]["state"] = "Disconnected";
            } else {
                devices[id]["state"] = "Connected";
            }
            console.log("device queue "+id+": "+devices[id]["state"]);
            devices[id]["lastActive"] = msg.body.eventTime;
            io.emit(id+"/device",devices[id]);
            msg.complete();
        });
    } catch(err) {
        console.log('State Error : '+err);
    }
    setTimeout(function() {stateListener(receiver);}, LISTEN_INTERVAL);
}

async function initialize(){
    console.log("---start initializing---");
    connection.connect();
    console.log("database connected");
    getAllDevices();
    console.log("get all registered devices");
    const sbClient = ServiceBusClient.createFromConnectionString(sb.connectionstr); 
    const twinQueueClient = sbClient.createQueueClient(sb.queueNames.twin);
    const twinReceiver = twinQueueClient.createReceiver(ReceiveMode.peekLock);
    const stateQueueClient = sbClient.createQueueClient(sb.queueNames.state);
    const stateReceiver = stateQueueClient.createReceiver(ReceiveMode.peekLock);
    console.log("service bus connected");
    twinListener(twinReceiver);
    console.log("start listening twin update");
    stateListener(stateReceiver);
    console.log("start listening device state");

    const consumerClient = new EventHubConsumerClient("$Default", eh.connectionstr);
    console.log("event hub connected");
    const subscription = consumerClient.subscribe({
        processEvents: async (events, context) => {
            for (const event of events) {
                dateObj = new Date(event.systemProperties["iothub-enqueuedtime"]); 
                utcString = dateObj.toUTCString();
                id = event.systemProperties['iothub-connection-device-id'];
                io.emit(id+"/telemtry", JSON.stringify({"time": utcString,"body": event.body}));
            }
        },
        processError: async (err, context) => {
            console.log('Tele Error : '+err);
        }
    });
    console.log("start listening telemtry");

    console.log("---initialize complete---");
}
initialize();

// // helper method
// function toSend(dict, ele) {
//     result = {};
//     result[ele] = dict[ele];
//     return result;
// }

// // investigate node env variables
// console.log(process.env);

// app setup
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
        devicesToRender = {};
        twinsToRender = {};
        connection.query('SELECT device AS result FROM viewControl WHERE username = ?', [req.session.username], function(error, results, fields) {
            results.forEach(element => {
                devicesToRender[element['result']] = devices[element['result']];
                twinsToRender[element['result']] = twins[element['result']];
            });
            res.render('pages/index_socket',{
                username: req.session.username, 
                disable: "",
                devices: devicesToRender,
                twins: twinsToRender
            });
        });
	} else {
        req.session.message = "Please login to view home page";
        res.redirect('/login');
	}
});
// login page
app.get('/login', function(req, res) {
    res.render('pages/login',{username:"You haven't logged in", disable:"disabled",result:req.session.message?req.session.message:""});
});

// respond to login submit
app.post('/auth', function(req, res) {
	var username = req.body.username.trim();
	var password = req.body.password.trim();
	if (username && password) {
        connection.query('SELECT COUNT(*) AS result FROM users WHERE username = ? AND password = ?', 
                        [username, password], 
                        function(error, results, fields) {
            if (results[0]["result"] == 1) {
				if (loggedinUsers[username]) {
                    req.session.message = "This account have already logged in!";
                    res.redirect('/login');
                } else {
                    req.session.loggedin = true;
                    req.session.username = username;
                    loggedinUsers[username] = true;
                    res.redirect('/home');
                }
			} else {
                req.session.message = "Incorrect Username and/or Password!";
                res.redirect('/login');
            }		
		});		
	} else {
        req.session.message = "Please enter Username and Password!";
        res.redirect('/login');
	}
});

// respond to logout submit
app.get('/logout', function(req, res) {
    var username = req.session.username;
	if (req.session.loggedin && loggedinUsers[username]) {
        req.session.destroy();
        req.session.Views = null;
        // req.session.loggedin = false;
        loggedinUsers[username] = false;
        res.redirect('/login');
	} else {
        console.log('Unexpected error when logout!')
    }
});

// respond to invoke direct method
app.get('/method/:id/:methodname/:payload', function (req, res) {
    const methodUrl = 'https://'+hub.name+'.azure-devices.net/twins/'+req.params.id+'/methods?api-version=2020-03-13'
    request.post({
        url: methodUrl,
        headers: hub.head,
        json: {
                "methodName": req.params.methodname,
                "responseTimeoutInSeconds": 200,
                "payload": req.params.payload
        }
    }, 	function(error,response,body){
                console.log("Invoke "+response.statusCode);
                res.status(response.statusCode).json(body);
    });
});

// respond to twin desired name update
app.get('/twin/:id/:newname', function (req, res) {
    const twinUrl = 'https://'+hub.name+'.azure-devices.net/twins/'+req.params.id+'?api-version=2020-03-13'
    request.patch({
        url: twinUrl,
        headers: hub.head,
        json: {
            "properties": {
                "desired": {
                        "Name": req.params.newname
                }
            }
        }
    }, 	function(error,response){
        console.log("TwinUpdate "+response.statusCode);
        res.status(response.statusCode).send("success");
    });
});

server.listen(PORT, function () {
    console.log('app listening on port '+PORT+'!');
});