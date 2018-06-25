//rest api for admin interface or general use
var crud = require('../model/appController');
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
        origin: '*',
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
            Endpoint.find({}, function(err, endDocs){
                if(err) res.status(500).send({ message: 'Server error' });
                res.range({
                    first: req.range.first,
                    last: req.range.last,
                    length: endDocs.length
                });
                res.json({data:endDocs.slice(req.range.first, req.range.last + 1),total:endDocs.length});
            });
        }),

        //get single endpoint
        router.get("/:id",VerifyToken, function(req, res){
            log.info("Endpoint GET/:ID:" +JSON.stringify(req.params.id));
            Endpoint.find({_id:req.params.id}, function (err, endpoint) {
                if (err) return res.status(500).send("There was a problem on the Server.");
                if (!endpoint) return res.status(404).send("No user found.");
                res.status(200).json({data:endpoint});
            });
        }),
        //delete endpoint
        router.delete("/:id",VerifyToken, function(req, res){
            log.info("User DELETE/:ID:" +JSON.stringify(req.body));
            Endpoint.findOneAndDelete({_id:req.params.id}, function (err, user) {
                if (err) return res.status(500).send("There was a problem deleting the Endpoint.");
                log.info("Endpoint: " + Endpoint.cartName + " was deleted.");
                //remove endpoint from array
                res.status(200).send("User: " + Endpoint.cartName + " was deleted.");
            });
        }),

        //update endpoint
        router.put("/:id",VerifyToken, function(req, res){
                log.info("Endpoint PUT/:ID:" +JSON.stringify(req.body));
                log.info("URL ID: " + req.params.id);
                delete req.body.id;
                log.info("User PUT/:ID:" +JSON.stringify(req.body));
                Endpoint.findById(req.params.id,function (err, endpoint) {
                    const originalmac = endpoint.mac;
                    if (err) return res.status(500).send("There was a problem updating the Endpoint.");
                    endpoint.cartName = req.body.cartName;
                    endpoint.xmppJID = req.body.xmppJID;
                    endpoint.cartIP = req.body.cartIP;
                    endpoint.mac = req.body.mac;
                    endpoint.location = req.body.location;
                    endpoint.peopleTest = req.body.peopleTest;
                    endpoint.save(function(err){
                        log.info("Update success: "+JSON.stringify(endpoint));
                        //need to update array with new details- delete old endpoint and bring new endpoint back online
                        crud.deleteOneCartArray(originalmac, function(err, data){
                            if(err) {
                                res.status(500).send("Unknown DB error");
                                return log.error(err);
                            }
                            log.info(data);
                            crud.updateCartArray(endpoint, function(err, data){
                                if(err){
                                    res.status(500).send("Unknown DB error");
                                    return log.error(err);
                                }
                                log.info(data);
                                return res.status(200).json({data:endpoint});
                            })

                        });

                    })

                });
        }),
            // CREATES A NEW ENDPOINT
        router.post('/',VerifyToken, function (req, res) {

            Endpoint.find({xmppJID: req.body.xmppJID}, function (err, endpoint) {
                if(err||!endpoint.length){
                    log.info("DB Lookup Failure: "+err);
                    var newEndpoint = {
                        cartName: req.body.cartName,
                        xmppJID: req.body.xmppJID,
                        xmppServer:req.body.xmppServer||process.env.XMPPSERVER,
                        cartIP: req.body.cartIP||'unknown',
                        mac: req.body.mac || 'unknown',
                        peopleTest: "false" || req.body.peopleTest,
                        location: req.body.location,
                        version: "unknown"
                    };
                    try{
                        Endpoint.create(newEndpoint, function (err, endpoint) {
                                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                                crud.updateCartArray(newEndpoint, function(err,message){
                                    if(err){
                                        res.status(500).send("Unknown DB error");
                                        return log.error(err);
                                    }
                                    log.info(message);
                                    return res.status(200).send(endpoint);
                                });

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


