require('dotenv').config();
var hydraExpress = require('hydra-express');
var hydra = hydraExpress.getHydra();
var config = require('./hydraConfig');
var log = require('./logger');
var myutils = require('../myutils/myutils');

function onRegisterRoutes() {
    var express = hydraExpress.getExpress();
    var api = express.Router();
    //log.info(`Starting ${this.config.hydra.serviceName} (v.${this.config.hydra.serviceVersion})`);
    //log.info(`Service ID: ${hydra.getInstanceID()}`);
    api.get('/', function(req, res) {
        res.send({
        msg: `hello from ${hydra.getServiceName()} - ${hydra.getInstanceID()}`
        });
    
    });
    hydraExpress.registerRoutes({
        '': api
    });
}
hydra.on('message', function(message){
    log.info("hydra.message: "+JSON.stringify(message));
    myutils.sparkPost(JSON.stringify(message), process.env.SPARK_ROOM_ID);
});

hydraExpress.init(config, onRegisterRoutes);

module.exports = hydra;