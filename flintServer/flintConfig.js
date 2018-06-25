//Flint server configuration
require('dotenv').config();
var SparkWebSocket = require('ciscospark-websocket-events');
var accessToken = process.env.SPARK_BOT;
var webHookUrl =  "http://localhost:8080/flint";
var Flint = require('node-flint');
var log = require('../svrConfig/logger');
var crud = require('../model/appController');
var conversation = require('../flintConversations/conversations');


// Spark Websocket Intialization - websocket support is limited for bots
var sparkwebsocket = new SparkWebSocket(accessToken);
sparkwebsocket.connect(function(err,res){
  if (!err){
    log.info('flintConfig.websockets : '+res);
    sparkwebsocket.setWebHookURL(webHookUrl);
      
  }else{
    log.error("flintConfig.websockets Startup: "+err);
  }
});

// flint options
var config = {
  token: accessToken,
  port: process.env.WEBPORT,
  removeWebhooksOnStart: true,
  requeueMinTime: 500,
  requeueMaxRetry: 6,
  maxConcurrent: 5,
  minTime: 50
};

// init flint
var flint = new Flint(config);
flint.start();

//control authorization to the bot
function myAuthorizer(bot, trigger) {
  if(trigger.personEmail === process.env.APP_ADMIN) {
    return true;
  }
  else {
    bot.say("You are not authorized for use of this bot. I am outta here.");
    log.info("flintConfig.flint Access Info - unauthorized access : "+trigger.personEmail);
    bot.exit();
    return false;
  }
}

flint.setAuthorizer(myAuthorizer);

// add flint event listeners
flint.on('message', function(bot, trigger) {
  log.info('flintConfig : "%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);
  log.info("flintConfig : This is the room ID:"+ trigger.roomId);
});

flint.on('initialized', function() {
  log.info('flintConfig : initialized %s rooms', flint.bots.length);
  
  
});
flint.on('spawn', function(bot) {
  log.info('new bot spawned in room: %s', bot.room.id);
  var spaceId = bot.room.id;
  crud.findSpace(spaceId, function(err,spDetails){
    if(err){
      //creates new room and writes new room to JOSN
      crud.createSpace(spaceId, function(data){
        log.info('flintConfig : Room created: '+ JSON.stringify(data));
        return bot.say({markdown:"This is a personal bot monitor tool. Please remove if you are not authorized."});
      });}
    if(spDetails.spaceActive === 'true') {
      return log.info("flintConfig.spawn: Room active.");
    }});  
  bot.repeat;
});
flint.on('despawn', function(bot){
  log.info('flintConfig : Bot removed room: '+bot.room.id);
  var spaceId = bot.room.id;
  crud.findSpace(spaceId, function(err,spDetails){
    if(err) return log.error("flintConfig.despawn :"+err);
    crud.deleteSpace(spaceId, function(err, indexNo){
        if(err) return log.error("flint.despawn : "+err);
        log.info("flint.despawn : "+indexNo)
        return spDetails.writeToFile();
        
    })
    
  });
});
conversation(flint);

module.exports = flint;