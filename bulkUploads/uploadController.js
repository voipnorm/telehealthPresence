var crud = require('../model/appController');
var log = require('../svrConfig/logger');
var carts = crud.cartDataObj;
var VerifyToken = require('../users/VerifyToken');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/',VerifyToken, function (req, res) {

});


module.exports = router;
