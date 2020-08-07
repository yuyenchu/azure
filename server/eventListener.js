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

function unwrapTelemtry(data, key, eqtime, id) {
    console.log(JSON.stringify(data)+"\n\n");
    Object.keys(data).forEach(ele => {
        console.log(id+" start "+ele+"("+typeof(ele)+")"+": "+data[ele]+"("+typeof(data[ele])+")");
        if (ele == "values" && Array.isArray(data[ele])) {
            data[ele].forEach(element => {
                send = {};
                send[key] = element["value"];
                console.log(id+" val/arr : "+JSON.stringify(send)+" at "+(element["updateTimeStamp"]?element["updateTimeStamp"]:eqtime));
                request.post({
                    url: "http://localhost:3000/event/"+id,
                    json: {
                        "time": element["updateTimeStamp"]?element["updateTimeStamp"]:eqtime,
                        "body": send
                    }
                }, 	function(error,response){
                    if (error) {
                        console.log('Tele Error : '+error);
                    } else {
                        console.log("Tele : "+id+" ("+response.statusCode+")");
                    }
                });
            })
        } else if (Number(data[ele])){
            send = {};
            send[ele] = Number(data[ele]);
            console.log(id+" number : "+JSON.stringify(send)+" at "+(element["updateTimeStamp"]?element["updateTimeStamp"]:eqtime));
            request.post({
                url: "http://localhost:3000/event/"+id,
                json: {
                    "time": eqtime,
                    "body": send
                }
            }, 	function(error,response){
                if (error) {
                    console.log('Tele Error : '+error);
                } else {
                    console.log("Tele : "+id+" ("+response.statusCode+")");
                }
            });
        } else if (typeof(data[ele]) == "object"){
            console.log(id+" obj : "+JSON.stringify(data[ele]));
            unwrapTelemtry(data[ele], ele, eqtime, id);
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
            console.log("Tele : "+id);
            unwrapTelemtry(event.body, id, utcString, id);

            // request.post({
            //     url: "http://localhost:3000/event/"+id,
            //     json: {
            //         "time": utcString,
            //         "body": event.body
            //     }
            // }, 	function(error,response){
            //     console.log("Tele : "+id+" ("+response.statusCode+")");
            // });
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