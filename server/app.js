var express = require('express');
var cors = require('cors');
var router = require('./router');
var bodyparser = require('body-parser');
var app = express();

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/router',router);

var indexpage = express.createServer();
indexpage.use(express.staticProvider(__dirname + '/public'));
indexpage.get('/', function(req, res) {
    res.render('index.html');
});
indexpage.listen(80, function () {
    console.log('app listening on port 3000!');
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});
