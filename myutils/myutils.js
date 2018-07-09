//various tools for post messages

'use strict'
require('dotenv').config();
var request = require('request');
var sparkToken = process.env.SPARK_BOT;
var log = require('../svrConfig/logger');
const ris = require('cucm-risdevice-query').RisQuery;
const cucmIp = process.env.CUCMIPADDRESS;
const cucmAdmin = process.env.CUCMPRESENCEACCOUNT;
const cucmPwd = process.env.CUCMPRESENCEPWD;

//Spark message posts
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

exports.checkIp = function(mac, callback){
    const devices = [mac];
    log.info("Mac Requested: "+mac);
    const risReqXml = ris.createRisDoc({
        version: process.env.CUCMVERSION,
        query: devices
    });
    log.info('Processing Mac: '+risReqXml.query);
    const url = `https://${cucmIp}:8443` + ris.risPath;
    request({
        url: url,
        method: 'POST',
        body: risReqXml,
        headers: {
            'Content-Type': 'text/xml'
        },
        auth: {
            username: cucmAdmin,
            password: cucmPwd
        },
        strictSSL: false
    }, (err, resp, body) => {
        if(err) return log.error("CUCM Error : "+err);
        const parsedResponse = ris.parseResponse(body);
        log.info(JSON.stringify(parsedResponse));
        return callback(parsedResponse);
    });
}