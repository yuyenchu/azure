var express = require('express');
var bodyparser = require('body-parser');
var app = express();
var helper = require('./helper.js');
// declare config file path
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';
const config = require('config');
const request = require('request');
const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus"); 
const sb = config.get('serviceBus');
const PORT = config.get('port').state;
const MAX_LISTEN = 10;  // max message receive when listen
const LISTEN_INTERVAL = 1000;   // listen rate

// listen to state queue, receive(blocking call) and complete message
// pre: receiver != null, config valid
// post: call main app with http, schedule next receive
async function stateListener(receiver) {
    var messages = null;
    while (true) {
        try {
            messages = await receiver.receiveMessages(MAX_LISTEN);
        } catch(err) {
            console.log('State Error : '+err);
        }
        if (messages) {
            messages.forEach(msg => {
                var id = msg.body.data.deviceId;
                var conn = msg.body.eventType.replace("Microsoft.Devices.Device","");
                console.log("state queue "+id+": "+conn);
                request.post({
                    url: "http://localhost:3000/state/"+id,
                    json: {
                        state: conn,
                        lastActive: msg.body.eventTime
                    }
                }, 	function(error,response){
                    console.log("State : "+id+" ("+response.statusCode+")");
                });
                msg.complete();
            });
        } else {
            console.log('State Error : message undefine');
        }
        helper.sleep(LISTEN_INTERVAL);
    }
}

// use client to connect to servicebus queue
// pre: config valid
console.log("---sL start initializing---");
const sbClient = ServiceBusClient.createFromConnectionString(sb.connectionstr); 
const stateQueueClient = sbClient.createQueueClient(sb.queueNames.state);
const stateReceiver = stateQueueClient.createReceiver(ReceiveMode.peekLock);
console.log("sL service bus connected");
stateListener(stateReceiver);
console.log("start listening device state");
console.log("---sL initialize complete---");

// app setup
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// start server
// pre: config valid
app.listen(PORT, function () {
    console.log('stateListener listening on port '+PORT+'!');
});