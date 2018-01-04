var util = require('util');
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var https = require('https');
var url = require('url');
var statusCodes = http.STATUS_CODES;
var myutils = require('./myutils');
var log = require('../svrConfig/logger');

//pass in object versus single values
function Ping(data){
    //urls used for constant monitoring
    this.website = data.url;
    //uptime count before sending uptime message
    this.upTime = data.upTime;
    this.downTime = 3;
    //counter for when to send up time or down time messages
    this.upTimeCounter = 0;
    this.downTimeCounter = 0;
    //total time running monitor
    this.runningCounter = 0;
    //delay between ping website checks
    this.delay = data.delay;
    //number of repititions before ending monitor service
    this.repetitions = data.reps;
    //handle holds interval ID to allow it to be cleared
    this.handle = null;
    //method used by ping
    this.method = 'GET';
    
}

util.inherits(Ping,EventEmitter);

//Kick off ping
Ping.prototype.init = function(){
    var self =  this;
    var delay = self.delay;
    var reps = self.repetitions;
    log.info("spaceObj.init ..loading ping");
    self.pingInterval(delay, reps, function(){
        log.info("pingObject.init moving to starting ping...")
        self.ping(self.website);
    });
    return self;
};
//sets interval to start ping
Ping.prototype.pingInterval = function(delay, repetitions, cb){
    var self = this;
    var x = 0;
    log.info("ping.PingInterval loaded. Delay ="+delay+ ",reps = "+repetitions+ "report delay ="+self.upTime);
    self.handle = setInterval(function () {
        if (++x === repetitions) {
            cb();
            self.stopPing();
        }else{
            cb();
        }
    }, delay);
 return self;
};
//Ping method for checking website availability
Ping.prototype.ping = function(urlString){
    
    var self = this;
    var req;
    var options = url.parse(urlString);
    options.method = self.method;

    if(urlString.indexOf('https:') === 0) {
        req = https.request(options, function (res) {
           
            // Website is up
            if (res.statusCode === 200) {
                self.emit('up', res.statusCode);
                self.pingReport("up", res.statusCode, urlString);
                res.setEncoding('utf8');
            }
            // No error but website not ok
            else {
                self.emit('down',res.statusCode);
                self.pingReport("down", res.statusCode, urlString);
            }
        });
    }
    else {
        req = http.request(options, function (res) {
            // Website is up
            if (res.statusCode === 200) {
                self.emit('up', res.statusCode);
                self.pingReport("up", res.statusCode,urlString);
                res.setEncoding('utf8');
                
            }
            // No error but website not ok
            else {
                self.emit('down',res.statusCode);
                self.pingReport("down", res.statusCode, urlString);
            }
        });
    }

    req.on('error', function(err) {
        log.error("spaceObj.pintInterval: "+err);
        var data = self.responseData(404, statusCodes[404 +'']);
        self.emit('error', data);
        self.pingReport("down", data, urlString);
        
    });
    req.end();
    return self;
};
    
//generates either up time or down reports
Ping.prototype.pingReport = function(status, code, urlString){
    var self = this;
    var time = Date.now();
    ++self.runningCounter;
    
    if(status === "up"){
        self.downTimeCounter = null;
        ++self.upTimeCounter;
        if(self.upTime === self.upTimeCounter){
            self.upTimeCounter = 0;
            var websiteUp = ">**"+self.getFormatedDate(time)+" UTC**: Cart "+urlString+" is currently up.<br>"+
                    " Code: "+code +"<br> Monitoring has been running for "+(self.delay/60000)*self.runningCounter/60+" hours.";
            return myutils.sparkPost(websiteUp, process.env.SPARK_ROOM_ID);
            }else{
                return self;
        }
    }
    if(status === "down"){
        self.upTimeCounter = null;
        ++self.downTimeCounter;
        if(self.downTime === self.downTimeCounter) {
            self.downTimeCounter = 0;
            var websiteDown = ">**" + self.getFormatedDate(time) + " UTC**: Cart " + urlString + " has taken a tumble or is unknown.<br>" +
                " Code: " + JSON.stringify(code);
            return myutils.sparkPost(websiteDown, process.env.SPARK_ROOM_ID);
        }else{
            return self;
        }
    }

};

Ping.prototype.startPing =  function(){
    var self = this;
    
    self.init();
    
    return self;
};
Ping.prototype.stopPing = function(){
    var self = this;
    clearInterval(self.handle);
    self.handle = null;
    myutils.sparkPost("Monitor is now halted.", process.env.SPARK_ROOM_ID);
    self.updateWebsite(null);
    self.upTimeCounter = 0;
    return self;
};

Ping.prototype.responseData = function (statusCode, msg) {
    var time = Date.now();
    var data = {
        website: this.website,
        time: this.getFormatedDate(time),
        statusCode: statusCode,
        statusMessage: msg
    };

    return data;
};


Ping.prototype.getFormatedDate = function (time) {
    var currentDate = new Date(time);

    currentDate = currentDate.toISOString();
    currentDate = currentDate.replace(/T/, ' ');
    currentDate = currentDate.replace(/\..+/, '');

    return currentDate;
};
module.exports = Ping;