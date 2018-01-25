/**
 * Wakes the system up from standby at 8.00 in the morning
 * on weekdays and auto dials another endpoint. Other endpoint needs to be setup to Auto Answer.
 */

// library for communicating with video system
const xapi = require('xapi');

// how often to check time
const intervalSec = 60;

// Standard javascript built-ins such as date and timers are included
function checkTime() {
    const now = new Date();
    const weekday = now.getDay() > 0 && now.getDay() < 6;
    const wakeupNow = now.getHours() === 8 && now.getMinutes() < 2 && weekday;
    const sleepNow = now.getHours() === 17 && now.getMinutes() < 2 && weekday;

    if (wakeupNow) {xapi.command('standby deactivate');
        xapi.command("dial", {Number:"OTHERENDPOINT@YOURDOMAIN.COM"});
        console.log("Call Connecting");
    }

    if(sleepNow){
        xapi.command("call disconnect");
        xapi.command('standby activate');
        console.log("Call disconnecting");
    }

}

setInterval(checkTime, intervalSec * 1000);