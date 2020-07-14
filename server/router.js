var express = require('express');
var router = express.Router();
const request = require('request');

const options = {
  url: 'https://hub-test1.azure-devices.net/devices?api-version=2018-06-30',
  headers: {
	'User-Agent': 'request',
	'Content-Type': 'application/json',
	'Authorization': 'SharedAccessSignature sr=hub-test1.azure-devices.net&sig=ttX9fT38ugddM5g%2BISLKQaHL5Y2zrq5McsDzMVJ70yA%3D&se=1626159394&skn=iothubowner'
  }
};

 
router.route('/')
    	.get(function (req, res) {
	    	res.send("Connection success");
	});

router.route('/devices')
	.get(function (req, res) {
		request.get(options, function(error,response,body){
			console.log(response.statusCode);
			console.log(typeof body);
			var r={};
			var b = JSON.parse(body);
			b.forEach(element => r[element["deviceId"]]=element["connectionState"]);
			res.send(r);
		});
		//request.get(options).on('response', function(response) {
    		//	console.log(response.statusCode); 
    		//	console.log(response.headers['content-type']);
  		//}).pipe(res);
	});

module.exports = router;
