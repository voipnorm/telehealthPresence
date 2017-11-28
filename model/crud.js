var Space = require('./space');
var fs = require('fs');
var _= require('lodash');
var log = require('../svrConfig/logger');
var spaceDataObj = [];

//spaceId, spaceActive, city, campus, bldg,timeZone, setup, conversation
exports.createSpace = function(spaceId, callback){
    log.info(" Space being created " +spaceId);
    var spaceObj = {
                "spaceId" : spaceId,
                "spaceActive" : 'true',
                "setup" : 'complete', //change to null is welcome script is required
                "conversation" : null
                };
    var newSpace = new Space(spaceObj);
    spaceDataObj.push(newSpace);
    
    writeToJSON(function(){
        callback(newSpace);
    });
    
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
exports.activeRoomCounter = function(callback){
        var activeSpace = 0;
        _.forEach(spaceDataObj, function(space){
                if(space.spaceActive === "true") ++activeSpace;
        });
        return callback(activeSpace);
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
                "conversation" : space.conversation||"commands",
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

exports.writeToJSON = writeToJSON;
exports.spaceDataObj = spaceDataObj;




var spacesFilePath = './model/space.json';

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
    loadSpaces(function(){
    //log.info('Starting file watcher.....')
        log.info("crud.startUp: New Active spaces loaded : "+spaceDataObj.length);
    
    });
}
startUp();

