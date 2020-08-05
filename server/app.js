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
const { Registry } = require('azure-iothub');
const hub = config.get('hub');
const ms = config.get('mysql');
const PORT = config.get('port').main;

var loggedinUsers = {}; // record accounts login 
// keep track of all devices' status and twin 
// then inject into home page before render
// in form of {id: data}
var devices = {};
var twins = {};
// prepare to connect my sql data base
var connection = mysql.createConnection({
    host     : ms.host,
	user     : ms.user,
	password : ms.password,
	database : ms.database
});

// get all registered devices at iot hub for initialization
// skip when encounter http errors
// pre: config.hub valid, devices != null
// post: call getAllTwins on complete, set devices
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

// connect to iot hub registry and get twins
// pre: devices set(skip if empty), twins != null, registry valid
// post: set twins
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

// helper method for updating twin with twin patch
// pre: twinPath and data != null, key in Object.keys(data)
// post: twins from enter point twinPath update all difference 
//      from data, new key created if not exist already
function updateTwin(twinPath, data, key) {
    if (!twinPath[key] || typeof(data[key])!= "object"){
        twinPath[key] = data[key];
    } else {
        Object.keys(data[key]).forEach(element => {
            updateTwin(twinPath[key], data[key], element);
        });
    }
}

// initialize devices and twins
// pre: config file valid, connection != null
// post: twins and devices set, connected to database
async function initialize(){
    console.log("---start initializing---");
    connection.connect();
    console.log("database connected");
    getAllDevices();
    console.log("get all registered devices");
    console.log("---initialize complete---");
}
initialize();

// // investigate node env variables
// console.log(process.env);

// app setup
// using ejs views for dynamic page
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');
// set static directory
app.use(express.static(__dirname + '/public'));
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

// decide which page to go
// pre: res != null
// post: redirect res
app.get('/', function(req, res) {
    if (req.session.loggedin) {
        res.redirect('/home');
	} else {
        res.redirect('/login');
	}
});

// home page, only allow loggedin users
// pre: devices and twins set, views/pages/index_socket exist, res != null
// post: respond res
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

// manage page
app.get('/manage', function(req, res) {
    if (req.session.loggedin) {
        devicesToRender = {};
        twinsToRender = {};
        connection.query('SELECT device AS result FROM viewControl WHERE username = ?', [req.session.username], function(error, results, fields) {
            results.forEach(element => {
                devicesToRender[element['result']] = devices[element['result']];
                twinsToRender[element['result']] = twins[element['result']];
            });
            res.render('pages/manage',{
                username: req.session.username, 
                disable: "",
                devices: devicesToRender,
                twins: twinsToRender
            });
        });
	} else {
        req.session.message = "Please login to view manage page";
        res.redirect('/login');
	}
});

app.post('/addView/:id', function(req, res) {
    console.log("addView "+req.params.id);
    if (req.session.loggedin) {
        connection.query('SELECT COUNT(*) AS result FROM viewControl WHERE username = ? AND device = ?', 
                            [req.session.username, req.params.id], 
                            function(error, results, fields) {
            if (results[0]["result"] == 0) {
                console.log("view not already exist");
                connection.query('SELECT COUNT(*) AS result FROM devices WHERE id = ?',
                                    [req.params.id], 
                                    function(error, results, fields) {
                    if (results[0]["result"] == 1) {
                        console.log("device exist");
                        connection.query('INSERT INTO viewControl VALUES(?,?)', 
                                    [req.session.loggedin, req.params.id], 
                                    function(error, results, fields) {
                            if (error) {
                                console.log("Insert error: "+error);
                            } else {
                                console.log("insert success");
                                res.status(200).send("view added successfully");
                            }
                        });
                    } else {
                        res.status(304).send("device not found");
                    }
                });
            } else {
                res.status(304).send("view already exist");
            }
        });
    } else {
        res.status(403).send("Please login");
    }
});

// login page
// pre: views/pages/login exists
// post: respond to res
app.get('/login', function(req, res) {
    res.render('pages/login',{username:"You haven't logged in", disable:"disabled",result:req.session.message?req.session.message:""});
});

// respond to login submit, success if username and password valid, 
// the desired account not loggedin, current user not loggedin
// pre: connection connected, req.body.username and req.body.password and res != null
// post: redirect res
app.post('/auth', function(req, res) {
	var username = req.body.username.trim();
	var password = req.body.password.trim();
	if (username && password) {
        if (req.session.loggedin && username!=req.session.username){
            req.session.message = "You have already logged in as "+
                                req.session.username+
                                ", please logout before login another account!";
            res.redirect('/login');
        } else {
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
        }		
	} else {
        req.session.message = "Please enter Username and Password!";
        res.redirect('/login');
	}
});

// respond to logout submit, end the session and record logout
// pre: req.session.username and res and loggedinUsers != null
// post redirect res, set loggedinUsers
app.get('/logout', function(req, res) {
    var username = req.session.username;
	if (req.session.loggedin && loggedinUsers[username]) {
        req.session.destroy();
        loggedinUsers[username] = false;
        res.redirect('/login');
	} else {
        console.log('Unexpected error when logout!')
    }
});

// respond to invoke direct method, expect http error
// pre: id and methodname and payload and res != null, config valid
// post: send http call to iot hub, respond call status to res
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

// respond to twin desired name update and receive twin queue update call
app.route('/twin/:id/:newname?')
// pre: id and newname and res != null, config valid
// post: send http call to iot hub, respond call status to res
    .get(function (req, res) {
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
        res.status(response.statusCode).send("ok");
    });
// pre: id and req.body and res and io != null, config valid, twins set
// post: process and send twin patch with socket (update if desired and
//       reported match, else update desired to match reported), respond res
}).post(function (req, res) {
    if (req.body["properties"]["reported"] && req.body["properties"]["reported"]["Name"] &&
    req.body["properties"]["reported"]["Name"] != twins[req.params.id]["properties"]["desired"]["Name"]) {
        const twinUrl = 'https://'+hub.name+'.azure-devices.net/twins/'+id+'?api-version=2020-03-13'
        request.patch({
            url: twinUrl,
            headers: hub.head,
            json: {
                "properties": {
                    "desired": {
                            "Name": req.body["properties"]["reported"]["Name"]
                    }
                }
            }
        }, 	function(error,response){
            console.log("TwinUpdate to match report name "+response.statusCode);
        });
    } else {
        Object.keys(req.body).forEach(key => {
            updateTwin(twins[req.params.id], req.body, key);
        });
        io.emit(req.params.id+"/twin",twins[req.params.id]);
    }
    console.log("receive twin call: "+req.params.id);
    res.status(200).send("ok")
});

// receive state(connection status) queue update call
// pre: id and req.body and res and io != null, config valid, devices set
// post: send state change with socket, respond to res
app.post('/state/:id', function (req, res) {
    devices[req.params.id] = req.body;
    io.emit(req.params.id+"/device", devices[req.params.id]);
    console.log("receive event call: "+req.params.id);
    res.status(200).send("ok")
});

// receive event hub(telemtry) update call
// pre: id and req.body and res and io != null, config valid
// post: send telemtry with socket, respond to res
app.post('/event/:id', function (req, res) {
    io.emit(req.params.id+"/telemtry", req.body);
    console.log("receive event call: "+req.params.id);
    res.status(200).send("ok")
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