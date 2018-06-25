/**
 * Macro companion to the Ultrasound Control
 * - lets users toggle Proximity Mode to On/Off
 * - displays the current MaxVolume level
 */

const xapi = require('xapi')
const proximityID = 'ProximityOnOff';
const textBoxId = 'textBoxProximity';

// Change proximity mode to "On" or "Off"
function switchProximityMode(mode) {
    console.debug(`switching proximity mode to: ${mode}`)

    xapi.config.set('Proximity Mode', mode)
        .then(() => {
            console.info(`turned proximity mode: ${mode}`)
        })
        .catch((err) => {
            console.error(`could not turn proximity mode: ${mode} ${err}`)
        })
}

// React to UI events
function onGui(event) {
    // Proximity Mode Switch
    if ((event.Type === 'changed') && (event.WidgetId === proximityID)) {
        switchProximityMode(event.Value)
        return;
    }
}
xapi.event.on('UserInterface Extensions Widget Action', onGui);


//
// Proximity Services Availability
//

// Update Toogle if proximity mode changes
function updateProximityToggle(mode) {
    console.debug(`switching toggle to ${mode}`)

    xapi.command("UserInterface Extensions Widget SetValue", {
        WidgetId: proximityID,
        Value: mode
    })
}
xapi.config.on("Proximity Mode", mode => {
    console.log(`proximity mode changed to: ${mode}`)

    // Update toggle
    // [WORKAROUND] Configuration is On or Off, needs to be turned to lowercase
    updateProximityToggle(mode.toLowerCase());
    textBoxUpdate(mode);
})

// Refresh Toggle state
function refreshProximityToggle() {
    xapi.status.get("Proximity Services Availability")
        .then(availability => {
            console.debug(`current proximity mode is ${availability}`)
            switch (availability) {
                case 'Available':
                    updateProximityToggle('on');
                    textBoxUpdate('On');
                    return;

                case 'Disabled':
                default:
                    updateProximityToggle('off');
                    textBoxUpdate('Off');
                    return;
            }
        })
        .catch((err) => {
            console.error(`could not read current proximity mode, err: ${err.message}`)
        })
}

function textBoxUpdate(stringValue){
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: textBoxId,
        Value: "Proximity "+stringValue,
    });
}
// Initialize at widget deployment
refreshProximityToggle();