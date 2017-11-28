'use strict'
require('dotenv').config();
var request = require('request');
var sparkToken = process.env.SPARK_BOT;
var log = require('../svrConfig/logger');
var http = require('http');
var https = require('https');
var url = require('url');
var _ =require('lodash');
//Spark message posts for scheduler
exports.sparkPost = function(text, to) {
    request({
        url: 'https://api.ciscospark.com/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sparkToken
        },
        body:
        JSON.stringify({'roomId': to,
        'markdown': text})
    }, function (error, response, body) {
        if (error) {
            log.error("myutils.sparkPost : "+error);
        } else {
            log.info("myutils.sparkPost : "+response.statusCode, body);
        }
    });
};

exports.dailyReportCollection = function (urlString, callback) {
    var req;
    var options = url.parse(urlString);
    var body = "";
    var botStatsObj ={
        "botName":"",
        "roomCount": "",
        "URL": ""
    };
    botStatsObj.website = urlString;

    if(urlString.indexOf('https:') === 0) {
        req = https.request(options, function (res) {
           // Website is up
            if (res.statusCode === 200) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                     
                    console.log(chunk);
                    try {
                        body = JSON.parse(chunk);
                        log.info("myutils.dailyreport https: "+body.name);
                        botStatsObj.botName = body.name;
                        botStatsObj.roomCount = body.roomCount;
                    } catch (e) {
                        log.info("not JSON..........");
                    }
                 });
            }
            // No error but website not ok
            else {
                log.error("Space.dailyreport : Failed report");
            }
        });
    }
    else {
        req = http.request(options, function (res) {
            // Website is up
            if (res.statusCode === 200) {
                res.setEncoding('utf8');
                 res.on('data', function (chunk) {
                     
                    console.log(chunk);
                    try {
                        body = JSON.parse(chunk);
                        log.info("myutils.dailyreport http: "+body.name);
                        botStatsObj.botName = body.name;
                        botStatsObj.roomCount = body.roomCount;
                        log.info("myutils.dailyReportCollection test : "+botStatsObj.botName);
                        callback(botStatsObj);
                    } catch (e) {
                        log.info("not JSON..........");
                    }
                 });
            }
            // No error but website not ok
            else {
                log.error("Space.dailyreport : Failed report");
            }
        });
    }
    req.on('error', function(err) {
        log.error("Space.dailyreport : Failed report"+err);
        
    });
    req.end();
    
    return;
};
exports.botStats = function (botsArray, callback){
  var botStatsAr = [];  
    _.forEach(botsArray,function(bot){
        var name = bot.botName;
        var roomCount = bot.roomCount;
        var url = bot.website;
        var complete = 
            "Name : "+name+"<br>"+
            "Rooms : "+roomCount+"<br>"+
            "URL : "+url+'<br>';
        botStatsAr.push(complete);
    })
    printArray(botStatsAr, function(data){
        var desStg = data;
        log.info("myutils.botstats : "+desStg);
        return callback(desStg);
    });
    
};

function printArray(array, callback){
    var desStg = array.toString()
                .replace(/\[/g, '')
                .replace(/\]/g, '')
                .replace(/,/g, '')
                .trim();
    return callback(desStg);
}