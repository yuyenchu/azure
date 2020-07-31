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
const PORT = config.get('port').twin;
const MAX_LISTEN = 10;  // max message receive when listen
const LISTEN_INTERVAL = 1000;   // listen rate

// listen to twin queue, receive(blocking call) and complete message
// pre: receiver != null, config valid
// post: call main app with http, schedule next receive
async function twinListener(receiver) {
    var messages = null;
    while (true) {
        try {
            messages = await receiver.receiveMessages(MAX_LISTEN);
        } catch(err) {
            console.log('Twin Error : '+err);
        }
        if (messages) {
            messages.forEach(msg => {
                var id = msg.userProperties.deviceId;
                console.log("twin queue "+id);
                    request.post({
                        url: "http://localhost:3000/twin/"+id,
                        json: msg.body
                    }, 	function(error,response){
                        console.log("Twin  : "+id+" ("+response.statusCode+")");
                    });
                msg.complete();
            });
        } else {
            console.log('Twin Error : message undefine');
        }
        helper.sleep(LISTEN_INTERVAL);
    }
}

// use client to connect to servicebus queue
// pre: config valid
console.log("---tL start initializing---");
const sbClient = ServiceBusClient.createFromConnectionString(sb.connectionstr); 
const twinQueueClient = sbClient.createQueueClient(sb.queueNames.twin);
const twinReceiver = twinQueueClient.createReceiver(ReceiveMode.peekLock);
console.log("tL service bus connected");
twinListener(twinReceiver);
console.log("start listening twin update");
console.log("---tL initialize complete---");

// app setup
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// start server
// pre: config valid
app.listen(PORT, function () {
    console.log('twinListener listening on port '+PORT+'!');
});