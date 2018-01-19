const xapi = require('xapi');

var did = "";
function listenToGui() {
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {

        if (event.Type === 'pressed') {
            console.log('Unknown button pressed', event);
            if(event.WidgetId === "dialButton"){
                xapi.command("dial", {Number:did});
                did="";
                textBoxUpdate(did);
            }else if(event.WidgetId==="backSpace"){
                backSpaceString(did);
            }else{
                const newdigit = event.Value;
                did = did+newdigit;
                console.log("DID new Value :"+did);
                textBoxUpdate(did);
                resetButton(event.WidgetId);
            }
        }
        if(event.Type === "released"){
            resetButton(event.WidgetId);
            console.log("release triggered");
        }
    });
}
function resetButton(widgetID){
    xapi.command('UserInterface Extensions Widget UnsetValue', {
        WidgetId: widgetID,
    });

    console.log("button reset done");
}
function backSpaceString(string){
    did = string.slice(0, -1);
    textBoxUpdate(did);
}

function textBoxUpdate(stringValue){
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: "textBox",
        Value: stringValue,
    });
}

listenToGui();