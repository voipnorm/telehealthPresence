require('dotenv').config();
var flint = require('./flintServer/flintConfig');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var log = require('./svrConfig/logger');
var crud = require('./model/crud');
const cors = require('cors');

//app.use(cors());


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//rest api configuration
require('./svrConfig/rest')(app, {});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: false,
    exposedHeaders: 'content-range',

}));

// define express path for incoming webhooks
app.post('/flint',webhook(flint));

app.use(express.static(path.resolve(__dirname, 'bot')));

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