require('dotenv').config();
var flint = require('./flintServer/flintConfig');
var webhook = require('node-flint/webhook');
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var log = require('./svrConfig/logger');
var crud = require('./model/crud');
var bodyParser = require('body-parser');
var db = require('./model/db');
var AuthController = require('./users/authController');
var endpointController = require('./endpoints/endpointController');
var userController = require('./users/userController');
var fs = require('fs');

var app = express();

app.use(bodyParser.json());

// define express path for incoming webhooks
app.post('/flint',webhook(flint));

//rest api configuration
app.use('/api/auth', AuthController);
app.use('/api/endpoints', endpointController);
app.use('/api/users',userController);

app.use(express.static(path.resolve(__dirname, 'bot')));

var server = app.listen(process.env.WEBPORT, function () {
  log.info('server : Chatbot listening on port %s', process.env.WEBPORT);
});

var sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
    passphrase: 'secretworthkeeping'
};


https.createServer(sslOptions, app).listen(process.env.SECUREWEBPORT);

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  log.info('server : stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});

module.exports = app;