//help chat text used in help command
var welcome = "**Hi!Welcome to Telehealth Presence Bot. I can help with DNS and external Cisco Expressway configuration.<br>**";
var firstTime = "**Hi."+
    " Thanks for inviting me to the space. Please use the **/help or just help** to get started and see supported features.";
var setup = "";
var step1 = "<br>**Step 1**: Just type **/commands** to see the available list of commands.";
var step2 = "<br>**Step 2**: Start using me to troubleshoot DNS and External Expressway issues.";
var step3 = "";
var additionalCommands = "";
var rmSettings = "<br>To see what your current space settings are type **/settings**.<br>";
var inRoomFeedback = "<br> To provide feedback in the space your using use **/feedback ***your feedback* command.";


//group help
var welcomeGroup = "**Hi! **";

var setupGroup = "<br>stuff ";

var inRoomFeedbackGroup = " <br>To provide feedback in the space your using use **@chatbot feedback ***your feedback* command.";

var commands =  "**/command**             - A list of currently available commands.<br>"+
    "**/expressway** *domain* - Does a lookup for all SRV records for Cisco UC Expressway.<br>"+
    "**/expscan** *domain*    - Does a lookup for Cisco UC Expressway SRV records and scans for open ports using TCP sockets.<br>"+
    "**/feedback** *text*     - Send feedback or issues to Telehealth Presence creators.<br>"+
    "**/help**                - Space setup instructions.<br>"+
    "**/lookup** *domain*       - Lookup a domain based on IPv4.<br>"+
    "**/lookup6** *domain*       - Lookup a domain based on IPv6.<br>"+
    "**/printrecords** *domain* - See what external records are required for your Cisco Expressway deployment.<br>"+
    "**/release**             - See recent updates and features added to Telehealth Presence Bot and whats coming.<br>"+
    "**/resolve** *type* *domain* - Resolve the following record types: A, AAAA, MX, TXT, SRV, PTR, NS, CNAME, SOA, NAPTR."+
    " Example usage is **/resolve A** *google.com* .<br>"+
    "**/settings**            - Shows your current space settings.<br>"+
    "**/scan** *port* *host* - Performs a TCP port socket connection to see if port is open.<br>"+
    "**/s4b** *domain*        - Does a SRV look up for Skype for Business Federation SRV record.<br>"+
    "**/url** *url*           - Parse a URL using Node.js url module, shows result of the URL object produced.<br>"+
    "**/xmpp** *domain*       - Does a SRV record look up for XMPP record.";

var adminCommands =  "**/adminCommand** - A list of currently available adminstrative commands.<br>"+
    "**/spaceID** - See the space ID of this space.<br>"+
    "**/spaceCount** - See how many spaces this application/bot has been added to.<br>"+
    "**/who** - See who all else is in the room with you.";

var presenceCommands = "**/presenceCommand** - A list of currently available commands for telehealth presence functions.<br>"+
    "**/bulkUploads** - Use a CSV file to mass upload endpoints<br>"+
    "**/broadcast** 'yourmessage' - Send a broadcast message to all online endpoints of this application.<br>"+
    "**/offlineReport** - See what endpoints are currently offline<br>"+
    "**/findEndpoint** - Find current status of an endpoint using its JID username<br>"+
    "**/newCart** - Start the new cart dialog for adding a single endpoint.<br>";

var helpTextSetup = [welcome+setup+step1+step2+step3,additionalCommands+rmSettings+inRoomFeedback];

var helpGroup = [welcomeGroup,setupGroup, inRoomFeedbackGroup];
var getStarted = [firstTime,inRoomFeedback];
//builing the array

exports.helpTextSetup = helpTextSetup;
exports.helpGroup = helpGroup;

exports.help = function(language, callback){

    for (var i = 0; i< helpTextSetup.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(helpTextSetup[n]);
                },i* 1000);
            }(i));
        }
   
};

exports.helpGroup = function(language, callback){

    for (var i = 0; i< helpGroup.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(helpGroup[n]);
                },i* 1000);
            }(i));
        }
   
};

exports.getStarted = function(language, callback){
    for (var i = 0; i< getStarted.length; i++){

            (function(n) {
                setTimeout(function(){
                    
                    callback(getStarted[n]);
                },i* 1500);
            }(i));
        }
};

exports.commands = commands;
exports.adminCommands = adminCommands;
exports.presenceCommands = presenceCommands;