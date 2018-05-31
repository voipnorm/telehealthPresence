//rest api for admin interface or general use
var crud = require('../model/crud');
var Endpoint = require('./endpoints');
var log = require('../svrConfig/logger');
var carts = crud.cartDataObj;
var range = require('express-range');
var VerifyToken = require('../users/VerifyToken');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(range({
        accept: 'endpoints',
        limit: 10,
    }));
router.use(cors({
        origin: 'http://localhost:3000',
        credentials: false,
        exposedHeaders: 'content-range',

}));
    //get all endpoints with content-range
        router.get("/",VerifyToken, function(req, res) {
            log.info("Endpoint List verified and routing");
            let endpoints = [];
            log.info("Endpoint request made");
            let num = carts.length;
            res.header("Access-Control-Allow-Origin", "*");
            log.info("Carts API request : "+carts.length);
            if (isFinite(num) && num > 0) {
                for (i = 0; i <= num - 1; i++) {
                    endpoints.push({
                        id: i,
                        xmppJID: carts[i].xmppJID,
                        cartName: carts[i].cartName,
                        cartIP: carts[i].cartIP,
                        status: carts[i].cartStatus,
                        location: carts[i].location
                    });
                }
                res.range({
                    first: req.range.first,
                    last: req.range.last,
                    length: endpoints.length
                });
                res.json({data:endpoints.slice(req.range.first, req.range.last + 1),total:endpoints.length});
            //res.status(200).send(endpoints);
            }else {
                res.status(400).send({ message: 'invalid number supplied' });
            }
        }),
        //get single endpoint
        router.get("/:id",VerifyToken, function(req, res){
            log.info(req.params.id);
            let cartId = req.params.id;
            crud.findCart(cartId, function(err,endpoint){
                if(err) {
                    res.status(400).send({ message: 'invalid cart JID' })
                }else{
                    let ep = {
                        xmppJID: endpoint.xmppJID,
                        cartName: endpoint.cartName,
                        cartIP: endpoint.cartIP,
                        status: endpoint.cartStatus,
                        location: endpoint.location
                    }
                    res.json(ep);
                }

            })
        }),
        //get status of all endpoints
        router.get("/status",VerifyToken, function(req, res) {
            let endpoints = [];
            let num = carts.length;
            res.header("Access-Control-Allow-Origin", "*");
            log.info("Carts API request : "+carts.length);
            if (isFinite(num) && num > 0) {
                for (i = 0; i <= num - 1; i++) {
                    endpoints.push({
                        id: i,
                        cartName: carts[i].cartName,
                        cartIP: carts[i].cartIP,
                        status: carts[i].cartStatus,
                        location: carts[i].location
                    });
                }
            res.status(200).send(endpoints);
            }else {
                res.status(400).send({ message: 'invalid number supplied' });
            }
        }),
        //delete endpoint
        router.delete("/:id",VerifyToken, function(req, res){
            log.info(req.params.id);
            let cartId = req.params.id;
            crud.deleteCart(cartId, function(err,message){
                if(err) {
                    res.status(400).send({ message: 'invalid cart JID' })
                }else{
                    res.status(200).send(message);
                }

            })
        }),
        //update endpoint
        router.put("/:id",VerifyToken, function(req, res){

        }),
            // CREATES A NEW ENDPOINT
        router.post('/:id',VerifyToken, function (req, res) {

            Endpoint.find({xmppJID: req.params.id}, function (err, endpoint) {
                if(err||!endpoint.length){
                    log.info("DB Lookup Failure: "+err);
                    try{
                        Endpoint.create({
                                cartName: req.body.cartName,
                                xmppJID: req.body.xmppJID,
                                xmppPwd: req.body.xmppPwd,
                                xmppServer:req.body.xmppServer,
                                cartIP: req.body.cartIP,
                                endpointPwd: req.body.endpointPwd,
                                peopleTest: "false" || req.body.peopleTest,
                                location: req.body.location,
                                version: "unknown"
                            },
                            function (err, endpoint) {
                                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                                res.status(200).send(endpoint);
                            });

                    }catch(e){
                        return res.status(500).send("Unknown DB error");
                    }

                }else{
                    return res.status(500).send("DB Failure to add endpoint. Endpoint already exist")
                }

            });
        });

module.exports = router;


