var express = require('express');
var bodyparser = require('body-parser');
var app = express();

// declare config file path
process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';
const config = require('config');
const request = require('request');
const { EventHubConsumerClient } = require("@azure/event-hubs");
const eh = config.get('eventhub');
const PORT = config.get('port').event;

function unwrapTelemtry(data, key, out, id) {
    Object.keys(data).forEach(ele => {
        if (Number(data[ele])){
            out[ele] = Number(data[ele]);
        } else if (ele == "values" && Array.isArray(data[ele])) {
            data[ele].forEach(element => {
                sned = {};
                send[key] = element["value"];
                request.post({
                    url: "http://localhost:3000/event/"+id,
                    json: {
                        "time": element["updateTimeStamp"],
                        "body": send
                    }
                }, 	function(error,response){
                    console.log("Tele : "+id+" ("+response.statusCode+")");
                });
                io.emit(id+"/telemtry", send);
            })
        } else if (typeof(ele) == "object"){
            unwrapTelemtry(data[ele], ele, out, id);
        }
    });
}

// use client to connect to servicebus queue
// pre: config valid
console.log("---eL start initializing---");
const consumerClient = new EventHubConsumerClient("$Default", eh.connectionstr);
console.log("event hub connected");

// listen to eventhub, receive(blocking call) telemtry
// pre: consumerClient != null, config valid
// post: process telemtry and call main app with http
consumerClient.subscribe({
    processEvents: async (events, context) => {
        for (const event of events) {
            dateObj = new Date(event.systemProperties["iothub-enqueuedtime"]); 
            utcString = dateObj.toUTCString();
            id = event.systemProperties['iothub-connection-device-id'];
            msg = JSON.stringify({"time": utcString,"body": event.body});
            request.post({
                url: "http://localhost:3000/event/"+id,
                json: {
                    "time": utcString,
                    "body": event.body
                }
            }, 	function(error,response){
                console.log("Tele : "+id+" ("+response.statusCode+")");
            });
        }
    },
    processError: async (err, context) => {
        console.log('Tele Error : '+err);
    }
});
console.log("start listening telemtry");
console.log("---eL initialize complete---");


// app setup
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// start server
// pre: config valid
app.listen(PORT, function () {
    console.log('eventListener listening on port '+PORT+'!');
});