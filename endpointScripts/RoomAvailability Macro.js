const xapi = require('xapi');


var dnd = "Room Available";
var tpDNDStatus = "Inactive";
var tpAAStatus = "On";


function listenToGui() {
    xapi.status.on('Conference DoNotDisturb', DNDChanged);
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
        //console.log(event);
        if (event.WidgetId === 'DNDToggle') {
            //console.log('Unknown togglebutton', event);
            if(event.Value === "on"){
                dnd="Room Occupied";
                tpDNDStatus = "Activate";
                tpAAStatus = "Off";

                textBoxUpdate(dnd);
                setDND(tpDNDStatus);


                setAutoAnswer(tpAAStatus);
            }else if(event.Value === "off"){
                dnd="Room Available";
                textBoxUpdate(dnd);
                tpDNDStatus = "Inactive";
                setDND(tpDNDStatus);
                tpAAStatus = "On";
                setAutoAnswer(tpAAStatus);
            }else{
                console.log("Macro error");
            }
        }

    });
}

function setDND(status){
    console.log(status);
    if(status==="Activate"){
        xapi.command('Conference DoNotDisturb activate')
            .catch((error) => { console.error(error); });
    }else{
        xapi.command('Conference DoNotDisturb deactivate')
            .catch((error) => { console.error(error); });
    }

}
function toggleUpdate(status){
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: "DNDToggle",
        Value: status,
    });
}

function setAutoAnswer(status){
    //console.log(status);
    xapi.config.set('Conference AutoAnswer Mode', status);
}

function textBoxUpdate(stringValue){
    xapi.command('UserInterface Extensions Widget SetValue', {
        WidgetId: "textBoxDND",
        Value: stringValue,
    });
}

function DNDChanged(status){
    console.log("This is the status: "+status);
    if(status === "Active"){
        dnd="Room Occupied";
        tpDNDStatus = "Activate";
        tpAAStatus = "Off";
        toggleUpdate('on');
        textBoxUpdate(dnd);
    }else{
        dnd="Room Available";
        tpDNDStatus = "Inactive";
        tpAAStatus = "on";
        toggleUpdate('off');
        textBoxUpdate(dnd)
    }

}

listenToGui();