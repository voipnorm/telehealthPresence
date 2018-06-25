/*
*
* Macro companion to the SpeakerTrack Diagnostic mode
*/

const xapi = require('xapi');
const stdID = 'STDOnOff';
let stdStatus = "Stop";

function listenToGui() {
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
        //console.log(event);
        if (event.WidgetId === stdID) {
            //console.log('Unknown togglebutton', event);
            if(event.Value === "on"){
                stdStatus="Start";
                textBoxUpdate(stdStatus);
                setSTD(stdStatus);

            }else if(event.Value === "off"){
                stdStatus="Stop";
                textBoxUpdate(stdStatus);
                setSTD(stdStatus);

            }else{
                console.log("Macro error");
            }
        }

    });
}

function setSTD(status){
    console.log(status);
    if(status==="Start"){
        xapi.command('Cameras SpeakerTrack Diagnostics Start')
            .catch((error) => { console.error(error); });
    }else{
        xapi.command('Cameras SpeakerTrack Diagnostics Stop')
            .catch((error) => { console.error(error); });
    }

}

function textBoxUpdate(stringValue){
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: "textBoxSTD",
        Value: "Speaker Track Diagnostics Mode: "+stringValue,
    });
}



listenToGui();