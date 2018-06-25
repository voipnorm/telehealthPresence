var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var range = require('express-range');
var verifyToken = require('./verifyToken');
var log= require('../svrConfig/logger');
var bcrypt = require('bcryptjs');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./user');
var cors = require('cors');
router.use(range({
    accept: 'users',
    limit: 10,
}));

router.use(cors({
    origin: '*',
    credentials: false,
    exposedHeaders: 'content-range',

}));

    // CREATES A NEW USER
    router.post('/',verifyToken, function (req, res) {
        log.info("User Post:" +JSON.stringify(req.body));
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);
        var newUser = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        };
        User.create(newUser,function (err, user) {
                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                res.status(200).send(user);
            });
    });

    // RETURNS ALL THE USERS IN THE DATABASE
    router.get('/',verifyToken, function (req, res) {
        log.info("User GET:" +JSON.stringify(req.body));
        User.find({}, function (err, users) {
            if (err) return res.status(500).send("There was a problem finding the users.");
            res.range({
                first: req.range.first,
                last: req.range.last,
                length: users.length
            });
            res.json({data:users.slice(req.range.first, req.range.last + 1),total:users.length});
        });
    });

    // GETS A SINGLE USER FROM THE DATABASE
    router.get('/:id',verifyToken, function (req, res) {
        log.info("User GET/:ID:" +JSON.stringify(req.params.id));
        User.find({_id:req.params.id}, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            res.status(200).json({data:user});
        });
    });

    // DELETES A USER FROM THE DATABASE
    router.delete('/:id',verifyToken, function (req, res) {
        log.info("User DELETE/:ID:" +JSON.stringify(req.body));
        User.findOneAndDelete({_id:req.params.id}, function (err, user) {
            if (err) return res.status(500).send("There was a problem deleting the user.");
            log.info("User: " + user.name + " was deleted.");
            res.status(200).send("User: " + user.name + " was deleted.");
        });
    });

    // UPDATES A SINGLE USER IN THE DATABASE --- TBD
    router.put('/:id',verifyToken, function (req, res) {
        log.info("User PUT/:ID:" +JSON.stringify(req.body));
        log.info("URL ID: " + req.params.id);
        delete req.body.id;
        log.info("User PUT/:ID:" +JSON.stringify(req.body));

        User.findById(req.params.id,function (err, user) {
            var userPassword = user.password;
            if (userPassword != req.body.password) {
                userPassword = bcrypt.hashSync(req.body.password, 8)
            }
            if (err) return res.status(500).send("There was a problem updating the user.");
            user.name = req.body.name;
            user.email = req.body.email;
            user.password = userPassword;
            user.save(function(err){
                if(err){return res.status(500).send("There was a problem updating the user.");}
                log.info("Update success: "+JSON.stringify(user));
                return res.status(200).json({data:user});
            })

        });
    });

module.exports = router;
