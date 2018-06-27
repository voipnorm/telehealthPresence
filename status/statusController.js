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

//get status of all endpoints
router.get("/",VerifyToken, function(req, res) {
    let endpoints = [];
    let num = carts.length;
    res.header("Access-Control-Allow-Origin", "*");
    log.info("Carts API request : "+carts.length);
    if (isFinite(num) && num > 0) {
        for (var i = 0; i <= num - 1; i++) {
            endpoints.push({
                _id: i,
                cartName: carts[i].cartName,
                cartIP: carts[i].cartIP,
                status: carts[i].cartStatus,
                location: carts[i].location,
                version: carts[i].version
            });
        }
        res.range({
            first: req.range.first,
            last: req.range.last,
            length: endpoints.length
        });
        res.json({data:endpoints.slice(req.range.first, req.range.last + 1),total:endpoints.length});

    }else {
        res.status(400).send({ message: 'invalid number supplied' });
    }
});

module.exports = router;