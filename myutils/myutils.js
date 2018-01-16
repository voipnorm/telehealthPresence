//various tools for post messages

'use strict'
require('dotenv').config();
var request = require('request');
var sparkToken = process.env.SPARK_BOT;
var log = require('../svrConfig/logger');

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