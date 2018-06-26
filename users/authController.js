/*
Generate web token, register users and enable login to admin web interface
 */
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('./user');
var secret = process.env.SECRETTOKEN;
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var log = require('../svrConfig/logger');
var cors = require('cors');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors({
    origin: '*',
    credentials: false,
    exposedHeaders: 'content-range',

}));

//register users. Admin account token is only allowed to register users using this method.

router.post('/register', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    if(token === process.env.WEBADMINTOKEN){
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        var newUser = {
            name : req.body.name,
            email : req.body.email,
            password : hashedPassword
        };
        User.create(newUser, function (err, user) {
                if (err) return res.status(500).send("There was a problem registering the user.");
                // create a token
                var token = jwt.sign({ id: user._id }, secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send({ auth: true, token: token });
            });
    }

});
//Returns user details based on token
router.get('/me', function(req, res) {
    var token = req.headers['x-access-token'];
    log.info("Header sent"+req.headers['x-access-token']);
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        res.status(200).send(decoded);
    });
});
//User login
router.post('/login', function(req, res) {
    log.info("Login request from "+req.body.email);
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
        var token = jwt.sign({ id: user._id }, secret, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token });
    });
});

module.exports = router;