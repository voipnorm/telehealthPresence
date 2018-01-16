//load JSON and other file as well as intial opbject cart and space creation

require('dotenv').config();
var Space = require('./space');
var Cart = require('./cart');
var fs = require('fs');
var _= require('lodash');
var log = require('../svrConfig/logger');
var spaceDataObj = [];
var cartDataObj = [];

//spaceId, spaceActive, city, campus, bldg,timeZone, setup, conversation
exports.createSpace = function(spaceId, callback){
    log.info(" Space being created " +spaceId);
    var spaceObj = {
                "spaceId" : spaceId,
                "spaceActive" : 'true',
                "setup" : 'complete', //change to null is welcome script is required
                "conversationState" : {conversation:'commands', state: null}
                };
    var newSpace = new Space(spaceObj);
    spaceDataObj.push(newSpace);

    writeToJSON(function(){
        callback(newSpace);
    });
    
};

exports.createCart = function(cart, callback){
    log.info(" Cart being created " +cart.cartName);
    var cartObj = {
        "cartName":cart.cartName,
        "xmppJID":cart.JID,
        "xmppPwd":process.env.XMPPCARTPWD,
        "xmppServer":process.env.XMPPSERVER,
        "cartIP":cart.ipAddress,
        "peopleTest":cart.peopleTest
    };

    //placeholder password used for testing, new cart adds in production should work once password changed
    if(process.env.XMPPCARTPWD != "placeholder"){
        var newCart = new Cart(cartObj);
        cartDataObj.push(newCart);
        writeCartToJSON(function(){
            callback(newCart);
        });
    }else{
        log.info("crud.createCart: Simulating writing to file completed.");
        callback("Cart up date simulation complete");
    }


};

exports.findSpace = function(spaceIdString, callback){
    log.info('crud.findspace space find called by:'+spaceIdString);
    var foundspace = _.find(spaceDataObj, {spaceId: spaceIdString});
        
    if(!foundspace) return callback(new Error("space undefined"));
        
    log.info('crud.findspace Found space Id: '+foundspace.spaceId);
    return callback(null,foundspace);
};

exports.deleteSpace = function(spaceIdString, callback){
    var spaceIndex = _.findIndex(spaceDataObj, {spaceId: spaceIdString});
    
    if(!spaceIndex) return callback(new Error("space already deleted"));
    spaceDataObj.splice(spaceIndex, 1);
    
    return callback(null, "Space deleted : "+spaceIndex);
};

exports.findCart = function(cartIdString, callback){
    log.info('crud.findCart Cart find called by:'+cartIdString);
    var foundcart = _.find(cartDataObj, {xmppJID: cartIdString});

    if(!foundcart) return callback(new Error("cart undefined"));

    log.info('crud.findspace Found cart Id: '+foundcart.cartName);
    return callback(null,foundcart);
};

exports.deleteCart = function(cartIdString, callback){
    var cartIndex = _.findIndex(cartDataObj, {xmppJID: cartIdString});

    if(!cartIndex) return callback(new Error("space already deleted"));
    cartDataObj.splice(cartIndex, 1);

    return callback(null, "Cart deleted : "+cartIndex);
};


exports.activeRoomCounter = function(callback){
    var activeSpace = 0;
    _.forEach(spaceDataObj, function(space){
        if(space.spaceActive === "true") ++activeSpace;
    });
    return callback(activeSpace);
};

exports.cartReporter = function(callback){
    var cartCount = 0;
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

function writeToJSON(callback){
    var spArray = [];
    var jobCount = spaceDataObj.length;
    log.info('crud.writeToJSON: Space being writen to file');
    _.forEach(spaceDataObj, function(space){
        var spaceObj = {
                "spaceId" : space.spaceId,
                "spaceActive" : space.spaceActive,
                "setup" : space.setup||null,
                "dnsServer" : space.dnsServer||null,
                "conversationState" : {"conversation":space.conversation||"commands"},
                "webUrls":space.webUrls
                };
        spArray.push(spaceObj);
        if(--jobCount === 0 ){
            fs.writeFile("./model/space.json", JSON.stringify(spArray, null , 2), function(err) {
                if(err) {
                    log.info(err);
                    
                }else{
                    log.info("crud.writeToJSON: Output saved to /spaces.json.");
                    return callback();
                }
                
            });
        }
        
    });
    
}

function writeCartToJSON(callback){
    var cartArray = [];
    var jobCount = cartDataObj.length;
    log.info('crud.writeToJSON: Cart being writen to file');
    _.forEach(cartDataObj, function(cart){
        var cartObj = {
            "cartName":cart.cartName,
            "xmppJID":cart.JID,
            "xmppPwd":process.env.XMPPCARTPWD,
            "xmppServer":process.env.XMPPSERVER,
            "cartIP":cart.ipAddress,
            "peopleTest":cart.peopleTest

        };
        cartArray.push(cartObj);
        if(--jobCount === 0 ){
            fs.writeFile("./model/cart.json", JSON.stringify(cartArray, null , 2), function(err) {
                if(err) {
                    log.info(err);

                }else{
                    log.info("crud.writeToJSON: Output saved to /spaces.json.");
                    return callback();
                }

            });
        }

    });

}
exports.writeCartToJSON = writeCartToJSON;
exports.writeToJSON = writeToJSON;
exports.spaceDataObj = spaceDataObj;
exports.cartDataObj = cartDataObj;




var spacesFilePath = './model/space.json';
var cartFilePath = './model/cart.json';
//loadspaces on first load and reload from Array
//spaceId, spaceActive, city, campus, bldg,timeZone, setup, conversation
function loadSpaces(callback){
    
    readFile(spacesFilePath,function(array){
        var jobCount = array.length;
        if(array.length === 0){
            return callback();
        }else{
            _.forEach(array, function(space){
                
                
               
                spaceDataObj.push(new Space(space));
                
                
                if(--jobCount === 0) return callback();
            });
            
        }
    });
}
function loadcarts(callback){

    readFile(cartFilePath,function(array){
        var jobCount = array.length;
        if(array.length === 0){
            return callback();
        }else{
            _.forEach(array, function(data){



                cartDataObj.push(new Cart(data));


                if(--jobCount === 0) return callback();
            });

        }
    });
}
//read spaces file back into memory
function readFile(file, callback){
    var content='';
    fs.readFile(file,'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        try{
            content = JSON.parse(data);
            
        }catch (e){
            return log.info(e);
        }
        return callback(content);
    });
}
//start process
function startUp(){
    log.info("Loading carts ...")
    loadcarts(function(){
        log.info("crud.startUp: New Carts loaded : "+cartDataObj.length);
    });
    loadSpaces(function(){
    //log.info('Starting file watcher.....')
        log.info("crud.startUp: New Active spaces loaded : "+spaceDataObj.length);
    
    });
}
startUp();

