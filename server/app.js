var express = require('express');
var cors = require('cors');
var router = require('./router');
var bodyparser = require('body-parser');
var app = express();

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/router',router);

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});
