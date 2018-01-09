var util = require('util');
var EventEmitter = require('events').EventEmitter;
var crud = require('./crud');
var myutils = require('../myutils/myutils');
var validUrl = require('valid-url');
var _ = require('lodash');
var log = require('../svrConfig/logger');
var schedule = require('node-schedule');
//var XmppUser = require('../myutils/xmpp');
//pass in object versus single values
function Space(data){
    //space ID
    this.spaceId = data.spaceId;
    //Disable space but not delete on bot removal
    this.spaceActive = data.spaceActive;
    //Setup currently not in use
    this.setup = data.setup;
    //setting not in use
    this.dnsServer = null;
    //setting not in use
    this.conversationState = data.conversationState;
}

util.inherits(Space,EventEmitter);

Space.prototype.updateConversationState =  function(obj){
    var self = this;
    self.conversationState = {
        conversation: obj.conversation,
        state: obj.state,
        cartName: null,
        ipAddress: null
    };
    return self;
};



Space.prototype.updatednsServer = function(param){
    var self = this;
    self.dnsServer = param;
    return self;
};

Space.prototype.updateActive = function(param){
    var self = this;
    self.spaceActive = param;
    return self;
};

Space.prototype.updateSetup = function(param){
    var self = this;
    self.spaceSetup = param;
    return self;
};
Space.prototype.writeToFile = function(){
    var self = this;
    crud.writeToJSON(function(){
        log.info("spaceObj.Writing to file......");
        self.emit('writeComplete');
    });
    return;
};
Space.prototype.writeCartToFile = function(){
    var self = this;
    crud.writeCartToJSON(function(){
        log.info("spaceObj.Writing to file......");
        self.emit('writeComplete');
    });
    return;
};

module.exports = Space;