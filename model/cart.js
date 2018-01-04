var util = require('util');
var EventEmitter = require('events').EventEmitter;
var myutils = require('../myutils/myutils');
var validUrl = require('valid-url');
var _ = require('lodash');
var log = require('../svrConfig/logger');
var schedule = require('node-schedule');
var Ping = require('../myutils/ping');
var xmpp = require('simple-xmpp');

//pass in object versus single values
function Cart(data){

    this.cartIP = data.cartIP;
    this.cartStatus = "offline";
    this.cartName = data.cartName;

    //xmpp
    this.xmppJID = data.xmppJID;
    this.xmppPwd = data.xmppPwd;
    this.xmppServer = data.xmppServer;
    this.interval = 1;
    this.reportTiming =  60;
    this.url = "http://"+this.cartIP+"/web/signin?next=/web/users";
    this.pingObj = {};
    this.init();
    this.xmppUser;


}

util.inherits(Cart,EventEmitter);

Cart.prototype.init = function(){
    var self = this;
    self.pingCheck();
    self.xmppInit();
};

Cart.prototype.pingCheck =  function(){
    var self = this;
    var reps = 900000000;

    log.info("cart.pingCheck : is loading....");
    var delay =  (self.interval * (60 * 1000));
    self.pingObj = new Ping({url: self.url, delay: delay, reps: reps, upTime:self.reportTiming});
    self.pingObj.startPing();
    return self;
};

Cart.prototype.xmppInit =  function(){
    log.info("Cart.obj: loading "+this.xmppJID);
    var self = this;
    self.xmppUser = new xmpp.SimpleXMPP();
    self.xmppUser.connect({
        "jid": self.xmppJID,
        "password": self.xmppPwd,
        "host": self.xmppServer,
        "port":5222
    });
    self.presenceStatusMonitor();
    self.xmppUser.setPresence('away', self.cartName+' is coming online, please stand by');
    self.onError();
    self.onClose();
    return self;
};

Cart.prototype.presenceStatusMonitor =  function(){
    log.info("cartObj.presenceStatusMonitor: loaded.");
    var self = this;

    self.pingObj.on('up', function() {
        self.cartStatus = "online";
        log.info("cartObj.presenceStatusMonitor: cart online.");
        self.xmppUser.setPresence('online', self.cartName+' is available');
    });
    self.pingObj.on('down', function(){
        self.cartStatus = "offline";
        log.info("cartObj.presenceStatusMonitor: cart offline.");
        self.xmppUser.setPresence('dnd', self.cartName+' is not available');
    });
    self.pingObj.on('error', function(){
        self.cartStatus = "offline";
        log.info("cartObj.presenceStatusMonitor: cart offline.");
        self.xmppUser.setPresence('dnd', self.cartName+' is not available');
    });

    return self;
};

Cart.prototype.onClose = function(){
    var self = this;
    self.xmppUser.on('close', function() {
        log.info('cart.onClose: connection has been closed!');
        setTimeout(function(){
            self.xmppInit();
            }
            , 120000);
    });
};

Cart.prototype.onError =  function(){
    var self = this;
    self.xmppUser.on('error', function(err) {
        log.error(err);
        myutils.sparkPost(self.cartName+" XMPP account has taken a tumble please attend to its needs: "+err, process.env.SPARK_ROOM_ID);

    });
};

module.exports = Cart;