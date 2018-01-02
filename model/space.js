var util = require('util');
var EventEmitter = require('events').EventEmitter;
var crud = require('./crud');
var myutils = require('../myutils/myutils');
var validUrl = require('valid-url');
var _ = require('lodash');
var log = require('../svrConfig/logger');
var schedule = require('node-schedule');
var Ping = require('../myutils/ping');
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
    this.conversation = data.conversation;
    
    //urls used for constant monitoring
    this.webUrls = data.webUrls;
    //ongoing monitored sites
    this.monitored = [];


}

util.inherits(Space,EventEmitter);


Space.prototype.checkWebsite =  function(urltxt,cb){
    var self = this;
    if(validUrl.isWebUri(urltxt)) {
        log.info("spaceObj.checkweb: I am running as good uri");
        self.updateWebsite(urltxt);
        cb('uriOkay');
    }else{
        
        cb('uriNotOkay');
        log.error("spaceObj.checkWeb : URI broken");
    }
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

Space.prototype.updateWebsite = function(param){
    var self = this;
    self.website = param;
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
Space.prototype.loadURLArray =  function(reportTiming, cb){
    var self = this;
    var reps = 900000000;
    var pingarray = self.monitored;
    log.info("space.loadURLArray : is loading....");
    if(pingarray.length!= 0){
        return cb(new Error("Monitor already in progress, tried to start second time"), null);
        
    }
    _.forEach(self.webUrls, function(website){
        var delay =  (website.interval * (60 * 1000));
        log.info("space.loadURLArray : "+website.url+" is loading....");
        var pingObj = new Ping({url: website.url, delay: delay, reps: reps, upTime:reportTiming});
        pingObj.startPing();
        pingarray.push(pingObj);
    });
    cb(null,"Urls load sequence is complete.");
    return pingarray;
};
Space.prototype.stopMonitor = function(cb){
    var self = this;
    var pingarray = self.monitored;
    pingarray.length = 0;
    cb("Website monitor halted");
};
Space.prototype.updateURLArray = function(newUrl, cb){
    var self = this;
    var urlArray = self.webUrls;
    var urlObject = {
        "url": newUrl,
        "interval": "30"  
    };
    urlArray.push(urlObject);
    self.writeToFile();
};

Space.prototype.removeURLArray = function(oldUrl, cb){
    var self = this;
    var urlArray = self.webUrls;
    var urlIndex = _.findIndex(urlArray, {url: oldUrl});
    urlArray.splice(urlIndex, 1);
    self.writeToFile();
    cb();
};

Space.prototype.dailyReport = function(cb){
    var self=this;
    var spaceId = process.env.SPARK_ROOM_ID;
    log.info('Space.object: Processing daily report request....');
    schedule.scheduleJob("Daily"+spaceId,'00 00 07 00 * * 0-7', function(){
        log.info("Space.object : daily report delivered.");
        self.immediateReport();
        
    });
    cb("Request has been processed...");
    return self;
};
Space.prototype.cancelSchedule = function(cb){
    var self = this;
    var spaceId = process.env.SPARK_ROOM_ID;
    schedule.cancelJob("Daily"+spaceId);
    cb("Request has been processed...");
    return self;
};

Space.prototype.immediateReport = function(){
    var self=this;
    var spaceId = process.env.SPARK_ROOM_ID;
    
    function getData(urls,callback){
        var reportData =[];
        _.forEach(urls,function(bots){
            myutils.dailyReportCollection(bots.url, function(botObj){
                reportData.push(botObj)
                if(urls.length === reportData.length) return callback(reportData);
            });
            
        })
        
    }
    getData(self.webUrls,function(data){
        myutils.botStats(data, function(text){
           return myutils.sparkPost(text,spaceId);
        });
    });   
};

Space.prototype.responseData = function (statusCode, msg) {
    var time = Date.now();
    var data = {
        website: this.website,
        time: this.getFormatedDate(time),
        statusCode: statusCode,
        statusMessage: msg
    };

    return data;
};

Space.prototype.getFormatedDate = function (time) {
    var currentDate = new Date(time);

    currentDate = currentDate.toISOString();
    currentDate = currentDate.replace(/T/, ' ');
    currentDate = currentDate.replace(/\..+/, '');

    return currentDate;
};
module.exports = Space;