var express = require('express');
var router = express.Router();
const request = require('request');

const hubHead = {
	'User-Agent': 'request',
	'Content-Type': 'application/json',
	'Authorization': 'SharedAccessSignature sr=hub-test1.azure-devices.net&sig=ttX9fT38ugddM5g%2BISLKQaHL5Y2zrq5McsDzMVJ70yA%3D&se=1626159394&skn=iothubowner'
}

const sbHead = {
	'Content-Type': 'application/json',
	'Authorization': 'SharedAccessSignature sr=https%3A%2F%2Ftest-serbus1.servicebus.windows.net%2Ftest-queue1&sig=aMIhuiM3C5LSSyUYtDdja%2BFc3ZydlFEr/rUXzCY3d7o%3D&se=1626327881&skn=RootManageSharedAccessKey'
}
 
router.route('/')
    	.get(function (req, res) {
	    	res.send("Connection success");
	});

router.route('/devices')
	.get(function (req, res) {
		const deviceUrl = 'https://hub-test1.azure-devices.net/devices?api-version=2018-06-30'
		request.get({
			url: deviceUrl,
			headers: hubHead
		}, 	function(error,response,body){
					console.log("devices "+response.statusCode);
					var r={};
					var b = JSON.parse(body);
					b.forEach(element => r[element["deviceId"]]=element["connectionState"]);
					res.send(r);
		});
	});

router.route('/method/:id/:methodname/:payload')
	.get(function (req, res) {
		const twinUrl = 'https://hub-test1.azure-devices.net/twins/'+id+'/methods?api-version=2020-03-13'
		request.post({
			url: twinUrl,
			headers: hubHead,
			body: {
					"methodName": methodname,
					"responseTimeoutInSeconds": 200,
					"payload": payload
			}
		}, 	function(error,response,body){
					console.log("invoke "+response.statusCode);
					res.json(JSON.parse(body));
		});
	});

router.route('/twin/:id')
	.get(function (req, res) {
		const twinUrl = 'https://hub-test1.azure-devices.net/twins/'+req.params.id+'?api-version=2018-06-30'
		request.get({
			url: twinUrl,
			headers: hubHead
		}, 	function(error,response,body){
					console.log("twin "+response.statusCode);
					res.json(JSON.parse(body));
		});
	});

router.route('/queue')
	.get(function (req, res) {
		const sbUrl = 'https://test-serbus1.servicebus.windows.net/test-queue1/messages/head'
		request.post({
			url: sbUrl,
			headers: sbHead
		}, 	function(error, response, body) {
					// console.log(response.headers);
					console.log("queue "+response.statusCode);
					res.json({
						header: response.headers,
						body: JSON.parse(body)
					});
		});
	});
module.exports = router;
