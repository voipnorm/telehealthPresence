//load JSON and other file as well as intial opbject cart and space creation

require('dotenv').config();
var Space = require('./space');
var Cart = require('./cart');
var fs = require('fs');
var _= require('lodash');
var log = require('../svrConfig/logger');
var SpaceDB = require('../space/space');
var EndpointDB = require('../endpoints/endpoints');

module.exports =  function(spaceId, callback){
    var spaceDataObj = [];
    var cartDataObj = [];
    //SPACE CRUD operations
    function createSpace(){
        log.info(" Space being created " +spaceId);
        var spaceObj = {
            "spaceId" : spaceId,
            "spaceActive" : 'true',
            "setup" : 'complete', //change to null is welcome script is required
            "conversationState" : {"conversation":'commands', "state": null}
        };
        var newSpace = new Space(spaceObj);
        spaceDataObj.push(newSpace);
        SpaceDB.create(spaceObj, function(err, doc){
            if(err) log.info(err);
            log.info("New space created in DB");
        });

    }
    function findSpace(spaceIdString, callback){
        log.info('crud.findspace space find called by:'+spaceIdString);
        var foundspace = SpaceDB.find({spaceId: spaceIdString});

        if(!foundspace) return callback(new Error("space undefined"));

        log.info('crud.findspace Found space Id: '+foundspace.spaceId);
        return callback(null,foundspace);

    }
    function deleteSpace(spaceIdString, callback){
        SpaceDB.deleteOne({spaceId: spaceIdString}, function(err){
            if(err) return callback(new Error("space already deleted"));
            var spaceIndex = _.findIndex(spaceDataObj, {spaceId: spaceIdString});
            if(!spaceIndex) return callback(new Error("space already deleted"));
            spaceDataObj.splice(spaceIndex, 1);
            return callback(null, "Space deleted : "+spaceIndex);
        });
    }
    //CART CRUD Operations
    function createCart(cart, callback){
        log.info(" Cart being created " +cart.cartName);
        var cartObj = {
            "cartName":cart.cartName,
            "xmppJID":cart.xmppJID,
            "xmppPwd":cart.xmppPwd || process.env.XMPPCARTPWD,
            "xmppServer":process.env.XMPPSERVER,
            "cartIP":cart.cartIP,
            "endpointPwd": cart.endpointPwd || process.env.TPADMINPWD,
            "peopleTest":"false"||cart.peopleTest,
            "location": cart.location||'Unknown',
            "version": cart.version || "Unknown"

        };

        var newCart = new Cart(cartObj);
        cartDataObj.push(newCart);
        EndpointDB.create(cartObj, function(err, doc) {

        })

    }
    function findCart(cartIdString, callback){
        log.info('crud.findCart Cart find called by:'+cartIdString);
        var foundcart = _.find(cartDataObj, {xmppJID: cartIdString});

        if(!foundcart) return callback(new Error("cart undefined"));

        log.info('crud.findspace Found cart Id: '+foundcart.cartName);
        return callback(null,foundcart);
    }
    function deleteCart(cartIdString, callback){
        var cartIndex = _.findIndex(cartDataObj, {xmppJID: cartIdString});

        if(!cartIndex) return callback(new Error("Cart already deleted"));
        cartDataObj.splice(cartIndex, 1);
        EndpointDB.deleteOne({xmppJID: cartIdString}, function(err){
            if(err) log.info("Failed to delete endpoint from Database");
            return callback(null, "Cart deleted : "+cartIndex);
        })

    }
    function findOnlineEndpoint (callback){
        log.info('crud.findCart Cart find online rooms');
        var cartArray = [];
        _.forEach(cartDataObj, function(cart){
            if(cart.cartStatus === "online"){
                var newCart = {
                    "Endpoint": cart.cartName,
                    "Location": cart.location,
                };
                cartArray.push(newCart);
            }
        });
        if(cartArray.length === 0) return callback("No Endpoints available.")
        return callback(null,cartArray);

    }
    function activeRoomCounter(callback){
        var activeSpace = 0;
        _.forEach(spaceDataObj, function(space){
            if(space.spaceActive === "true") ++activeSpace;
        });
        return callback(activeSpace);
    }
    function cartReporter(callback){
        var cartArray = [];
        _.forEach(cartDataObj, function(cart){
            if(cart.cartStatus === "offline"){
                var newCart = {
                    "endpoint": cart.cartName,
                    "Status": cart.cartStatus,
                    "IP Address": cart.cartIP
                };
                cartArray.push(newCart);
            }
        });
        return callback(cartArray);
    };
    function loadSpaces(callback){
        SpaceDB.find({}, function(err, spaces){
            if(err) log.error("Spaces failed to load.");
            var jobCount = spaces.length;
            _.forEach(spaces, function(space){
                spaceDataObj.push(new Space(space));
                if(--jobCount === 0) return callback();
            });
        })
    }
    function loadCarts(callback){
        EndpointDB.find({}, function(err, endpoints){
            if(err) log.error("Endpoints failed to load.");
            var jobCount = endpoints.length;
            _.forEach(endpoints, function(endpoint){
                cartDataObj.push(new Cart(endpoint));
                if(--jobCount === 0) return callback();
            });
        })
    }

    function startUp(){
        log.info("Loading carts ...")
        loadCarts(function(){
            log.info("crud.startUp: New Carts loaded : "+cartDataObj.length);
            loadSpaces(function(){
                log.info("crud.startUp: New Active spaces loaded : "+spaceDataObj.length);
            });
        });

    }
    return{
        cartDataObj: cartDataObj,
        spaceDataObj: spaceDataObj,
        createSpace: createSpace,
        findSpace: findSpace,
        deleteSpace: deleteSpace,
        createCart: createCart,
        findCart: findCart,
        deleteCart: deleteCart,
        findOnlineEndpoint: findOnlineEndpoint,
        activeRoomCounter: activeRoomCounter,
        cartReporter: cartReporter,
        loadCarts:loadCarts,
        loadSpaces: loadSpaces,
        startUp: startUp,
    };
}();