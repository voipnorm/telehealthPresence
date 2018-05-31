

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var range = require('express-range');
var verifyToken = require('./verifyToken');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./user');
var cors = require('cors');
router.use(range({
    accept: 'users',
    limit: 10,
}));
router.use(cors({
    origin: 'http://localhost:3000',
    credentials: false,
    exposedHeaders: 'content-range',

}));

    // CREATES A NEW USER
    router.post('/',verifyToken, function (req, res) {
        User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            },
            function (err, user) {
                if (err) return res.status(500).send("There was a problem adding the information to the database.");
                res.status(200).send(user);
            });
    });

    // RETURNS ALL THE USERS IN THE DATABASE
    router.get('/',verifyToken, function (req, res) {
        User.find({}, function (err, users) {
            if (err) return res.status(500).send("There was a problem finding the users.");
            res.range({
                first: req.range.first,
                last: req.range.last,
                length: users.length
            });
            res.json({data:users.slice(req.range.first, req.range.last + 1),total:users.length});;
        });
    });

    // GETS A SINGLE USER FROM THE DATABASE
    router.get('/:id',verifyToken, function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            res.status(200).send(user);
        });
    });

    // DELETES A USER FROM THE DATABASE
    router.delete('/:id',verifyToken, function (req, res) {
        User.findByIdAndRemove(req.params.id, function (err, user) {
            if (err) return res.status(500).send("There was a problem deleting the user.");
            res.status(200).send("User: " + user.name + " was deleted.");
        });
    });

    // UPDATES A SINGLE USER IN THE DATABASE
    router.put('/:id',verifyToken, function (req, res) {
        User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.status(200).send(user);
        });
    });

module.exports = router;
