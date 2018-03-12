//creates main cart object for TP endpoints including exam rooms and carts

require('dotenv').config();
var TpXapi = require('../myutils/tpXapi');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var myutils = require('../myutils/myutils');
var log = require('../svrConfig/logger');
var Ping = require('../myutils/ping');
var xmpp = require('simple-xmpp');


//pass in object versus single values
function Cart(data){

    this.cartIP = data.cartIP;
    this.cartStatus = "offline";
    this.cartName = data.cartName;
    this.people="No";
    this.peopleTest = data.peopleTest;

    //xmpp
    this.xmppJID = data.xmppJID;
    this.xmppPwd = data.xmppPwd;
    this.xmppServer = data.xmppServer;
    this.endpointPwd = data.endpointPwd;
    this.interval = 1;
    this.reportTiming =  60;
    this.url = "http://"+this.cartIP+"/web/signin?next=/web/users";
    this.pingObj = {};
    this.init();
    this.xmppUser;
    this.location = data.location;
    this.version = data.version;


}

util.inherits(Cart,EventEmitter);

Cart.prototype.init = function(){
    var self = this;
    self.pingInit();
    self.xmppInit();

};

Cart.prototype.pingInit =  function(){
    var self = this;
    var reps = 900000000;

    log.info("cart.pingCheck : is loading....");
    var delay =  (self.interval * (30 * 1000));
    self.pingObj = new Ping({url: self.url, delay: delay, reps: reps, upTime:self.reportTiming});
    //self.pingObj.startPing();
    return self;
};


Cart.prototype.xmppInit =  function(){
    log.info("Cart.obj: loading "+this.xmppJID);
    var self = this;
    self.xmppUser = new xmpp.SimpleXMPP();
    self.xmppConnect();
    self.presenceStatusMonitor();
    self.xmppUser.setPresence('away', self.cartName+' is coming online, please stand by');
    self.onError();
    self.onClose();
    return self;
};

Cart.prototype.xmppConnect =  function() {
    var self = this;
    self.xmppUser.connect({
        "jid": self.xmppJID,
        "password": self.xmppPwd,
        "host": self.xmppServer,
        "port":5222
    });
    self.xmppUser.on('online', function(){
        self.pingObj.startPing();
    });
    return self;
};

Cart.prototype.presenceStatusMonitor =  function(){
    log.info("cartObj.presenceStatusMonitor: loaded.");
    var self = this;

    self.pingObj.on('up', function() {
        self.cartStatus = "online";
        if(self.peopleTest==="true"){
           self.peoplePresence();
        }else {
            log.info("cartObj.presenceStatusMonitor: cart " + self.cartName + " online.");
            self.xmppUser.setPresence('online', self.cartName + ' is available');
        }
    });
    self.pingObj.on('down', function(){
        self.cartStatus = "offline";
        log.info("cartObj.presenceStatusMonitor: "+self.cartName+ " offline.");
        self.xmppUser.setPresence('dnd', self.cartName+' is currently offline.');
    });
    self.pingObj.on('error', function(){
        self.cartStatus = "offline";
        log.info("cartObj.presenceStatusMonitor: cart "+self.cartName+ " offline in error.");
        self.xmppUser.setPresence('dnd', self.cartName+' is currently offline.');
    });

    return self;
};
Cart.prototype.peoplePresence =  function(){
    var self = this;
    var cart = {
        "username":process.env.TPADMIN,
        "password":this.endpointPwd || process.env.TPADMINPWD,
        "ipAddress":this.cartIP
    };
    const videoCodec = new TpXapi(cart);

    return videoCodec.getEndpointData()
        .then((endpoint) =>{
            console.log(endpoint);
            if(endpoint.dndActive === "Active"){
                self.cartStatus = "dnd";
                return self.xmppUser.setPresence('dnd', self.cartName + ' is occupied. Do Not Disturb');
            }else if(endpoint.peopleCountNumber > 0){
                self.cartStatus = "dnd";
                return self.xmppUser.setPresence('dnd', self.cartName + ' is occupied. Room has '+endpoint.peopleCountNumber+ " occupants.");
            }else if(endpoint.peoplePresenceActive === "Yes"){
                self.cartStatus = "away";
                return self.xmppUser.setPresence('away', self.cartName + ' is occupied.');
            }else if(endpoint.callStatusActive > 0){
                self.cartStatus = "away";
                return self.xmppUser.setPresence('away', self.cartName + ' is in a Call.');
            }else{
                self.cartStatus = "online";
                return self.xmppUser.setPresence('online', self.cartName + ' is available and unoccupied.');
            }

        })
        .catch(err => {
            console.log(err)
        });

    return self;
};
Cart.prototype.onClose = function(){
    var self = this;
    self.xmppUser.on('close', function() {
        log.info('cart.onClose: connection has been closed!');
        setTimeout(function(){
            self.xmppConnect();
            }
            , 120000);
    });
    return self;
};

Cart.prototype.onError =  function(){
    var self = this;
    self.xmppUser.on('error', function(err) {
        log.error(err);
        self.pingObj.stopPing();
        myutils.sparkPost(self.cartName+" XMPP account has taken a tumble please attend to its needs: "+err, process.env.SPARK_ROOM_ID);

    });
    return self;
};

module.exports = Cart;