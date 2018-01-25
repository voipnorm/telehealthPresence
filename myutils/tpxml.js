//communication with video TP units though XML API.

const log = require('../svrConfig/logger');
const jsxapi = require('jsxapi');

exports.requestPeoplePresence = function(cart, callback){
    const xapi = jsxapi.connect('ssh://' + cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });

    return xapi.status
        .get('RoomAnalytics PeoplePresence')
        .then((people) => {
            callback(people);
        })
        .catch(err => log.error(err));
};


exports.requestDND = function(cart, callback) {
    const xapi = jsxapi.connect('ssh://' + cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });
    return xapi.status
        .get('conference DoNotDisturb')
        .then((dnd) => {
            callback(dnd);
        })
        .catch(err => log.error(err));
};

exports.broadcastMessage =  function(cart, title, text , duration) {
    const xapi = jsxapi.connect('ssh://'+cart.ipAddress, {
        username: cart.username,
        password: cart.password
    });
    return xapi.command('UserInterface Message Alert Display', {
        Title: title,
        Text: text,
        Duration: duration,
    })
        .catch(err=> log.error(err));
};

