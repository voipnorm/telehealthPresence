
var crud = require('../model/crud');
var log = require('./logger');
var carts = crud.cartDataObj;
var range = require('express-range');

module.exports =  function(app){
    app.use(range({
        accept: 'endpoints',
        limit: 10,
    }))
    app.get("/endpoints", function(req, res) {

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
    app.get("/endpoint/:id", function(req, res){

    })
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
            res.range({
                first: req.range.first,
                last: req.range.last,
                length: endpoints.length
            });
            //res.json({data:endpoints.slice(req.range.first, req.range.last + 1),total:endpoints.length});
            res.status(200).send(endpoints);
        }else {
            res.status(400).send({ message: 'invalid number supplied' });
        }
    })




}



