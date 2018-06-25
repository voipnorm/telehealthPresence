
var log = require('../svrConfig/logger');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.send();
});


module.exports = router;