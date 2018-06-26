//verify tokens being processed by API

var jwt = require('jsonwebtoken');
var secret = process.env.SECRETTOKEN;
var log = require('../svrConfig/logger');

function verifyToken(req, res, next) {
    log.info("Header Token "+req.headers['x-access-token']);
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, secret, function(err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;