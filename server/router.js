process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';

const request = require('request');
const config = require('config');

const hub = config.get('hub');
const sb = config.get('serviceBus');

var express = require('express');
var router = express.Router();
 
router.route('/')
	.get(function (req, res) {
		console.log(JSON.stringify(hub));
		res.send("Connection success");
	});

router.route('/devices')
	.get(function (req, res) {
		const deviceUrl = 'https://'+hub.name+'.azure-devices.net/devices?api-version=2018-06-30'
		request.get({
			url: deviceUrl,
			headers: hub.head
		}, 	function(error,response,body){
					console.log("devices "+response.statusCode);
					var r={};
					var b = JSON.parse(body);
					b.forEach(element => r[element["deviceId"]]=element["connectionState"]);
					res.status(response.statusCode).send(r);
		});
	});

router.route('/method/:id/:methodname/:payload')
	.get(function (req, res) {
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
					console.log("invoke "+response.statusCode);
					res.status(response.statusCode).json(body);
		});
	});

router.route('/twin/:id')
	.get(function (req, res) {
		const twinUrl = 'https://'+hub.name+'.azure-devices.net/twins/'+req.params.id+'?api-version=2018-06-30'
		request.get({
			url: twinUrl,
			headers: hub.head
		}, 	function(error,response,body){
					console.log("twin "+response.statusCode);
					res.json(JSON.parse(body));
		});
	});

router.route('/queue')
	.get(function (req, res) {
		const sbUrl = 'https://'+sb.name+'.servicebus.windows.net/'+sb.queueName+'/messages/head'
		request.post({
		// request.delete({
			url: sbUrl,
			headers: sb.head
		}, 	function(error, response, body) {
					// console.log(response.headers);
					console.log("queue peek "+response.statusCode);
					if (response.statusCode<204) {
						res.status(response.statusCode).json({
							header: response.headers,
							body: JSON.parse(body)
						});
					} else {
						res.status(response.statusCode).send("Reached end of queue")
					}
		});
	})
	.delete(function (req, res) {
		const sbUrl = 'https://'+sb.name+'.servicebus.windows.net/'+sb.queueName+'/messages/'+req.params.id+'/'+req.params.token
		request.delete({
		// request.delete({
			url: sbUrl,
			headers: sb.head
		}, 	function(error, response, body) {
					// console.log(response.headers);
					console.log("queue delete"+response.statusCode);
		});
	});
module.exports = router;
