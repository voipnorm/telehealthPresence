//API for sending broadcast messages to all endpoints.

//rest api for admin interface or general use
var crud = require('../model/appController');
var log = require('../svrConfig/logger');
var carts = crud.cartDataObj;
var range = require('express-range');
var VerifyToken = require('../users/VerifyToken');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');
var tpxml = require('../myutils/tpxml');
var _= require('lodash');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(range({
    accept: 'endpoints',
    limit: 10,
}));
router.use(cors({
    origin: '*',
    credentials: false,
    exposedHeaders: 'content-range',

}));

//broadcast message to all endpoints.
router.post("/",VerifyToken, function(req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    log.info("Carts API request : "+carts.length);
    _.forEach(crud.cartDataObj, function(cart) {
        if(cart.cartStatus === "online"){
            let message = req.body.message;
            var cartObj = {
                "username":process.env.TPADMIN,
                "password":cart.endpointPwd,
                "ipAddress":cart.cartIP
            };
            tpxml.broadcastMessage(cartObj,"Important",message,"20", function(err, message){
                if(err)log.error("conversationFunction.broadcast: error "+err);
                log.info("conversationFunctions.broadcast: broadcast to endpoints success")
            });
        }else{
            log.info('Broadcast failed endpoint offline: '+cart.cartIP);
        }
    })
    return res.status(200).send("Broadcast complete.");
});

module.exports = router;