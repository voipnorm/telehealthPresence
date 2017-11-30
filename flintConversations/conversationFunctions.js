var crudDb = require('../model/crud');
var helpFile = require('../myutils/help.js');
var printLog = require('../myutils/changelog.js');
var _ = require('lodash');
var myutils = require('../myutils/myutils');
var netTools = require('../myutils/netTools');
var prettyjson = require('prettyjson');
var log = require('../svrConfig/logger');

module.exports = {
//test slash command
    hello: function(request, bot, trigger){
        if(bot.isGroup){
            log.info("conversationFunctions.hello : New group hello message sent");
            return bot.say('Hello %s! To get started just type @crb help', trigger.personDisplayName);
        }else{
            log.info("conversationFunctions.hello : 1:1 hello welcome sent");
            return bot.say('Hello %s! To get started just type help', trigger.personDisplayName);
        }
    },
//Prints out help array
    help: function(bot){
        log.info('conversationFunctions.help : Print help');
        if(bot.isGroup){
            log.info("conversationFunctions.help : help file accesssed");
            helpFile.help("en",function(data){
                return bot.say({markdown:data});
            });
        }else{
            log.info("conversationFunctions.help : 1:1 help file accesssed");
            helpFile.help("en",function(data){
                return bot.say({markdown:data});
            });
        }
    },
//prints out space settings to user
    settings: function(bot,spData){
        var urlArray = [];
        log.info("conversationFunctions.settings URLS : "+spData.webUrls);
        log.info('conversationFunctions.settings : Print space settings');
        _.forEach(spData.webUrls, function(website){
            var site = "URL :"+website.url+"<br>";
            urlArray.push(site);
        });
        var text = JSON.stringify(urlArray);
        return bot.say({markdown:'**Current Space Settings**<br>'+
            'Space ID: '+spData.spaceId+'<br>'+
            'Website monitored: '+spData.website+'<br>'+text
        });
    },
    spaceID: function(bot, trigger){
        log.info('conversationFunctions.spaceID : Space ID request.');
        bot.say({markdown:"Space ID is : "+trigger.roomId});
    },
//prints list of commands available to user
    commands: function(bot){
        log.info('conversationFunctions.commands : Print commands');
        return  bot.say({markdown: helpFile.commands});
    },
    adminCommands: function(bot){
        log.info('conversationFunctions.adminCommands : Print commands');
        return  bot.say({markdown: helpFile.adminCommands});
    },
//internal feedback command for simple request to developers from users
    feedback: function(request, bot, trigger){
        log.info('conversationFunctions.feedback : -> '+request);
        request = request + " Username: "+trigger.personEmail;
        var email = process.env.APP_ADMIN;
        bot.dm(email,request);
        return bot.say("Thank you for your feedback. For technical issues"+
        " I will get to them as soon as possible");
    },
//allows broadcast to all Spaces.
    broadcast: function(botsArray, request, bot, trigger){
        log.info('conversationFunctions.broadcast : all spaces broadcast message -> '+request);
        request = request.replace("/broadcast ",'');
                    
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            _.forEach(botsArray, function(bot) { bot.say({markdown:request}); });
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
//print out release infospation
    release: function(bot){
        log.info('conversationFunctions.release : roadmap request');
        printLog.printChangeLog(function(log){
            return bot.say({markdown:log});
        }); 
    
    },
//reset your defaults and go back through the welcome process
    reset: function(request, bot, trigger, spData){
        log.info('conversationFunctions.reset : reset space settings -> '+spData.roomId);
        bot.say("Your Space settings have been reset. To start the setup process just say 'hi' to begin.");
        return spData.conversation = 'commands';
    
    },

    who: function(bot){
        log.info("conversationFunctions.who : requested space users email");
        //log.info(JSON.stringify(bot.memberships,null, 2));
        _.forEach(bot.memberships,function(person){
            log.info(person.email);
            bot.say(person.email);
            });
        return;
    },
    spaceCount: function(botArrayNo, bot, trigger){
        log.info('conversationFunctions.spaceCount : Space count request.');
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            crudDb.activeRoomCounter(function(count){
                bot.say({markdown:"Current space count : " + botArrayNo + 
                    "<br> Active rooms : "+count });
            });
            
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
    appRestart: function(bot, trigger){
        log.info('conversationFunctions.appRestart : empty request, still under development');
        if(trigger.personEmail.match(process.env.APP_ADMIN)){
            log.info("conversationFunctions.appRestart : This does nothing.");
        }else{
            bot.say("Sorry but your are not authorised for this command."+
            " The authoritities have been notified.");
            return bot.dm(process.env.APP_ADMIN,'Unauthorised attempt by this person: '+trigger.personEmail);
        }
    },
//pass data to API.ai
    nlp: function(request, bot, trigger, spData){
        log.info('conversationFunctions.nlp : Request to API.AI');
        myutils.apiAiConversation(request,bot,trigger,spData,function(data){
            return bot.say({markdown: data});
        });
    },
    lookup: function(ver,request, bot, trigger){
        var text = request.replace('/lookup ', '')
                            .replace('/lookup6 ', '');
        if(!text||text==='') return bot.say("Make sure to specify a domain when doing a lookup.");
        var options = {
            family: ver,
            all: true
        };
        netTools.lookup(text, options, function(response){
            bot.say({markdown:response});
        });
    },
    
    resolve: function(request, bot, trigger){
        var text = request.split(' ');
        var type= text[1].toUpperCase();
        var domain = text[2];
        switch(type){
            case "A":
            case "AAAA":
            case "MX":
            case "TXT":
            case "SRV":
            case "PTR":
            case "NS":
            case "CNAME":
            case "SOA":
            case "NAPTR":
                netTools.resolve(domain, type, function(response){
                    bot.say({markdown:response});
                });
                break;
            default:
                bot.say({markdown: "Sorry but you need to specify what type of record"+
                    " such as **/resolveA** *google.com*"
                });
                break;
        }
    },
    
    xmpp: function(request, bot, trigger){
        var text = request.split(' ');
        var type= text[0].replace('/xmpp ','');
        var domain = text[1];
        
        domain = "_xmpp-server._tcp."+domain;
        netTools.resolve(domain, 'SRV', function(response){
            bot.say({markdown:response});
        });
    },
    s4b: function(request, bot, trigger){
        var text = request.split(' ');
        var type= text[0].replace('/s4b ','');
        var domain = text[1];
        
        domain = "_sipfederationtls._tcp."+domain;
        netTools.resolve(domain, 'SRV', function(response){
            bot.say({markdown:response});
        });
    },
    expressway: function(request, bot, trigger){
        var text = request.split(' ');
        var domain = text[1];
        var records = this.expressRecords(domain);
        netTools.express(records, function(response){
            bot.say({markdown:response});
        });
    },
    scan: function(request, bot, trigger){
        var text = request.split(' ');
        var port = text[1];
        var address = text[2];
        netTools.scanPort(port, address,function(response){
            bot.say(response);
        });
    },
    scanExpress: function(request, bot, trigger){
        var text = request.split(' ');
        var domain = text[1];
        var records = this.expressRecords(domain);
        netTools.scanExpress(records, function(response){
            bot.say({markdown:response});
        });
    },
    printRecords: function(request, bot, trigger){
        var text = request.split(' ');
        var domain = text[1];
        var records = this.expressRecords(domain);
        records = this.formatRecords(records);
        return bot.say(records);
    },
    expressRecords: function(domain){
        var h323cs,h323ls,sipTcp,sipUdp,sipsTcp,turn,edge;
        h323cs = "_h323cs._tcp."+domain;
        h323ls = "_h323ls._udp."+domain;
        sipTcp = "_sip._tcp."+domain;
        sipUdp = "_sip._udp."+domain;
        sipsTcp = "_sips._tcp."+domain;
        turn = "_turn._udp."+domain;
        edge = "_collab-edge._tls."+domain;
        var records = [h323cs,h323ls,sipTcp,sipUdp,sipsTcp,turn,edge];
        return records;
    },
    formatRecords: function(array){
        var options = {
            noColor: true
        };
        var srv = {
            h323 : [array[0],array[1]],
            SIP : [array[2],array[3]],
            SIPTLS : array[4],
            TURN : array[5],
            MRA: array[6]
            }; 
        srv = prettyjson.render(srv,options);
        console.log(srv);
        var txt = "DNS SRV external records recommended for your video/MRA deployment:\n";
        return  txt+srv;
    },
    loadUrls: function(request, bot, trigger, spData){
        bot.say("Urls loading in progress.....");
        spData.loadURLArray(function(data){
            bot.say(data);
        });
        return;
    },
    stopMonitor: function(request, bot, trigger, spData){
        spData.stopMonitor(function(){
            return bot.say("Monitoring has been halted for all URLS.")
        })
         return;
    },
    updateUrls: function(request,bot,trigger,spData){
        var text = request.split(' ');
        var website = text[1];
        spData.checkWebsite(website , function(status){
                if(status === 'uriOkay'){
                    spData.updateURLArray(website);
                    bot.say("Websites monitored update : "+website);
                }else{
                    bot.say("This URL you entered had some issues. Please try again.");
                }
            });
        return;
    },
    deleteUrls: function(website,bot,trigger,spData){
        spData.removeURLArray(website, function(data){
            return bot.say("Website removed: "+website);
        });
    },
    
    url: function(request, bot,trigger){
        var text = request.split(' ');
        var url = text[1];
        netTools.parseURL(url, function(data){
            bot.say({markdown:data});
        });
    },
    report: function(request, bot, trigger, spData){
        return spData.immediateReport();
    },
    schedule: function(request, bot, trigger, spData){
        var text = request.replace("/schedule ",'');
        if(text === "true"){
            spData.dailyReport(function(){
                return bot.say("Daily report request has been processed and is enabled.");
            });
        }else if(text==="false"){
           spData.cancelSchedule(function(){
               return bot.say("Daily report request has been processed and is disabled.");
           }) 
        }else{
            return bot.say("Your request could not be processed please use only true or false after the **/schedule** command.");
        }
        
    },
//default switch command
    finalChoice: function(request, bot, trigger){
        bot.say({markdown: "I currently only respond to commands so make sure to check them out. Use the "+
            "**/commands** command to see what I can do at anytime. To see this message at any stage just type help."
        });
     }

};

