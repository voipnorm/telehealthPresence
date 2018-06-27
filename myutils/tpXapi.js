//Constructor for creating a endpoint object with video xapi. Ability to scrape multiple API's.
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const log = require('../svrConfig/logger');
const jsxapi = require('jsxapi');

//pass in object versus single values
function TPXapi(endpoint){
    this.endpoint = endpoint;
    this.xapi;
    this.connectedStatus = 'false';
    this.peopleCountNumber;
    this.peoplePresenceActive;
    this.callStatusActive;
    this.dndActive;
    this.version;

}

util.inherits(TPXapi,EventEmitter);

//force update of data from endpoint
TPXapi.prototype.getEndpointData =  function(){
    return new Promise((resolve, reject) => {
        const self = this;
        return self.endpointUpdate()
            .then(() => {
                const endpoint = {
                    connectedStatus: self.connectedStatus,
                    peopleCountNumber: self.peopleCountNumber.Current,
                    peoplePresenceActive: self.peoplePresenceActive,
                    callStatusActive: self.callStatusActive,
                    dndActive: self.dndActive,
                    version: self.version,
                };

                return resolve(endpoint);
            })
            .catch(err => {
                return reject(err)
            })
    });
};


TPXapi.prototype.endpointUpdate = function(){
    const self = this;
    return self.connect()
        .then((status) => {
            log.info(status);
            return self.callStatus()
        })
        .then((status) => {
            log.info(status);
            return self.peopleCount()
        })
        .then((status) => {
            log.info(status);
            return self.peoplePresence()
        })
        .then((status) => {
            log.info(status);
            return self.dndStatus()
        })
        .then((status) => {
            log.info(status);
            return self.checkVersion()
        })
        .then((status) => {
            log.info(status);
            return self.closeConnect()
        })
        .catch((err) => {
            log.error(err);
        })
}

//connect to ssh service on endpoints
TPXapi.prototype.connect = function() {
    var self = this;
    return new Promise((resolve, reject) => {
        self.xapi = jsxapi.connect('ssh://' + self.endpoint.ipAddress, {
            username: self.endpoint.username,
            password: self.endpoint.password
        });
        self.connectedStatus = "true";
        resolve ("Connection open")
            .catch ((err) => {
                reject (log.error(err));
            });
    });
}
//check if ssh is already established
TPXapi.prototype.connectCheck = function (){
    if (this.connectedStatus === 'true') return;

};

//check for call status for endpoint not registered on local CUCM
TPXapi.prototype.callStatus =  function(){
    const self = this;
    return new Promise((resolve, reject) => {
        return this.xapi.status
            .get('SystemUnit State NumberOfActiveCalls')
            .then((call) => {
                self.callStatusActive = call;
                resolve(call);

            })
            .catch(err => reject(err));
    })
};

//check people count -1 is default for empty room
TPXapi.prototype.peopleCount =  function(){
    const self = this;
    return new Promise((resolve, reject) => {
        return self.xapi.status
            .get('RoomAnalytics PeopleCount')
            .then((status) => {
                self.peopleCountNumber = status;
                resolve(status);
            })
            .catch((err) => {
                if(err.code === 3){
                    resolve(self.peopleCountNumber = {Current : -1})
                }else(
                    reject(err)
                )
            });
    })
};
//
//
TPXapi.prototype.dndStatus = function(){
    const self =this;
    //log.info("tpxml.requestDND: Request sent.");
    return new Promise((resolve, reject) => {
        return self.xapi.status
            .get('conference DoNotDisturb')
            .then((dnd) => {
                self.dndActive = dnd;
                resolve(dnd);
            })
            .catch(err => reject(err));
    })
}
//check people presence api, return is either yes or no
TPXapi.prototype.peoplePresence =  function(){
    const self = this;
    //log.info("tpxml.peoplePresence: Request sent.")
    return new Promise((resolve, reject) => {
        return self.xapi.status
            .get('RoomAnalytics PeoplePresence')
            .then((status) => {
                self.peoplePresenceActive = status
                resolve(status);
            })
            .catch((err) => {
                if (err.code === 3) {
                    resolve(self.peopleCountNumber = {Current: -1})
                } else(
                    reject(err)
                )
            });
    })
};
//check firmware version
TPXapi.prototype.checkVersion = function(){
    //SystemUnit Software Version
    const self = this;
    return new Promise((resolve, reject) => {
        return self.xapi.status
            .get('SystemUnit Software Version')
            .then((version) => {
                self.version = version;
                resolve(version);
            })
            .catch(err => reject(err));
    })
};
//Check device type
TPXapi.prototype.checkType = function(){
    //SystemUnit type
    log.info("info: Checking system type.")
    const self = this;
    return new Promise((resolve, reject) => {
        return self.xapi.status
            .get('SystemUnit ProductPlatform')
            .then((type) => {
                self.type = type;
                resolve(type);
            })
            .catch(err => reject(err));
    })
};

//close ssh connection
TPXapi.prototype.closeConnect =  function(){
    const self = this;
    return new Promise((resolve, reject) => {
        log.info("xapi session closed.");
        self.connectedStatus = "false";
        resolve (self.xapi.close());

        return self;

    })
};

TPXapi.prototype.onError =  function(){
    self.on('error', function(err) {
        log.error(err);
    });
};
module.exports = TPXapi;