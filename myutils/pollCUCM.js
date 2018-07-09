
require('dotenv').config();
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const log = require('../svrConfig/logger');
const ris = require('cucm-risdevice-query').RisQuery;
const cucmIp = process.env.CUCMIPADDRESS;
const cucmAdmin = process.env.CUCMPRESENCEACCOUNT;
const cucmPwd = process.env.CUCMPRESENCEPWD;

function CUCMPoll(mac){
    this.mac = mac;
}
util.inherits(CUCMPoll,EventEmitter);

CUCMPoll.prototype.checkIP =  function(callback){
    var self = this;
    const devices = [this.mac];
    const risReqXml = ris.createRisDoc({
        version: process.env.CUCMVERSION,
        query: devices
    });
    log.info('Processing Mac: '+JSON.stringify(risReqXml));
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
        log.info(JSON.stringify(body))
        const parsedResponse = ris.parseResponse(body);
        log.info(JSON.stringify(parsedResponse));
        return callback(parsedResponse);
    });
};


module.exports = CUCMPoll;
