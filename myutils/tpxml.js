//communication with video TP units though XML API.
const log = require('../svrConfig/logger');
const jsxapi = require('jsxapi');

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
