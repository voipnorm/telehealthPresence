//rest api for admin interface or general use
var crud = require('../model/crud');
var log = require('./logger');
var carts = crud.cartDataObj;
var range = require('express-range');


module.exports =  function(app){
    app.use(range({
        accept: 'endpoints',
        limit: 10,
    })),
        //get all endpoints with content-range
        app.get("/endpoints", function(req, res) {
            let endpoints = [];
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
        app.get("/endpoints/:id", function(req, res){
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
        app.get("/status", function(req, res) {
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
        app.delete("/endpoints/:id", function(req, res){
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
        app.put("/endpoints/:id", function(req, res){

        }),
        //create endpoint
        app.post("/endpoints/:id", function(req, res){
            if (!req.body.cartName) return res.sendStatus(400);

            log.info("new endpoint request: "+req.params.id);
            let cartId = req.params.id;
            crud.findCart(cartId, function(err, endpoint){
                if(err){
                    let newCart = {
                        cartName : req.body.cartName,
                        cartIP : req.body.cartIP,
                        JID: req.body.xmppJID,
                        xmppPwd : req.body.xmppPwd,
                        endpointPwd: req.body.endpointPwd,
                        peopleTest : "false"|| req.body.peopleTest,
                        location : req.body.location,
                        version : "unknown"
                    };
                    crud.createCart(newCart,function(endpoint){
                        res.status(200).send("Update complete for: "+endpoint);
                    })

                }else{
                    res.status(400).send({ message: 'endpoint already exists' })
                }
            })


        })




}



