require('dotenv').config();
var flint = require('./flintServer/flintConfig');
var webhook = require('node-flint/webhook');
var express = require('express');
var https = require('https');
var path = require('path');
var log = require('./svrConfig/logger');
var crud = require('./model/appController');
var bodyParser = require('body-parser');
var db = require('./model/db');
var AuthController = require('./users/authController');
var endpointController = require('./endpoints/endpointController');
var userController = require('./users/userController');
var statusController = require('./status/statusController');
var broadcastController = require('./broadcast/broadcastController');
var fs = require('fs');

var app = express();

app.use(bodyParser.json());

// define express path for incoming webhooks
app.post('/flint',webhook(flint));
//CORS Configuration
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//rest api configuration
app.use('/api/auth', AuthController);
app.use('/api/endpoints', endpointController);
app.use('/api/users',userController);
app.use('/api/status', statusController);
app.use('/api/broadcast', broadcastController);
//Serve up admin interface
app.use('/', express.static(__dirname + '/public/home', { index: 'index.html' }));


var sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
    passphrase: process.env.SECRETTOKEN
};
crud.startUp();

https.createServer(sslOptions, app).listen(process.env.SECUREWEBPORT);

var server = app.listen(process.env.WEBPORT, function () {
  log.info('server : Chatbot listening on port %s', process.env.WEBPORT);
});



// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  log.info('server : stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});

module.exports = app;