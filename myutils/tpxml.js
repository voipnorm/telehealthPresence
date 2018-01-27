//communication with video TP units though XML API.

const log = require('../svrConfig/logger');
const jsxapi = require('jsxapi');

exports.requestPeoplePresence = function(cart, callback){
    const xapi = jsxapi.connect('ssh://' + cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });
    xapi.on('error', (err) => {
        return log.error(err);

    });
    log.info("tpxml.peoplePresence: Request sent.")

    return xapi.status
        .get('RoomAnalytics PeoplePresence')
        .then((people) => {
            log.info("peoplePresence.request returned "+people);
            return callback(null,people);
        })
        .then(()=> {
            log.info("xapi session closed.");
            return xapi.close();
        })
        .catch(err => callback(err, null));
};


exports.requestDND = function(cart, callback) {
    const xapi = jsxapi.connect('ssh://' + cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });
    xapi.on('error', (err) => {
        return log.error(err);

    });
    log.info("tpxml.requestDND: Request sent.")
    return xapi.status
        .get('conference DoNotDisturb')
        .then((dnd) => {
            return callback(null,dnd);
        })
        .then(()=> {
            log.info("xapi session closed.");
            return xapi.close();
        })
        .catch(err => callback(err, null));
};

exports.broadcastMessage =  function(cart, title, text , duration, cb) {
    const xapi = jsxapi.connect('ssh://'+cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });
    xapi.on('error', (err) => {
        return log.error(err);

    });
    return xapi.command('UserInterface Message Alert Display', {
        Title: title,
        Text: text,
        Duration: duration,
    })
        .then(()=> {
            log.info("xapi session closed.");
            return xapi.close();
        })
        .catch(err=> cb(err, null));
};

