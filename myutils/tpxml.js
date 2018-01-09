const ciscoTPClient = require('cisco-tp-client');
const convert = require('xml2js');
const log = require('../svrConfig/logger');

exports.requestXML = function(cart, callback){
    const sx80 = new ciscoTPClient({
        username: cart.username,
        password: cart.password
    }, cart.ipAddress);

    sx80
        .getXml("/Status/RoomAnalytics/PeoplePresence")
        .then(function(response) {
            convert.parseString(response, function (err, jsonresult) {
                if (err) log.error(err);
                callback(jsonresult.Status.RoomAnalytics[0].PeoplePresence[0])
            });
        })
        .catch(err=> log.info(err));
};

