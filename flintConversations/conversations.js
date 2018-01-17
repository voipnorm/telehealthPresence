/* 
Module parses all incoming requests from Spark webhooks and provides the responses for the bot from the node-flint framework.
*/
require('dotenv').config();
var crudDb = require('../model/crud');
var botString = process.env.SPARK_BOT_STRING;
var convoFunc = require('./conversationFunctions');
var convoNewCart = require('./conversationNewCart');
var log = require('../svrConfig/logger');

module.exports = function(flint){
    flint.hears(/(^| ).*( |.|$)/i, function(bot, trigger) {
 
        log.info("conversation.hears : triggered");
        
        var text = trigger.text.replace(botString+' ','');
        var spaceId = trigger.roomId;
        
                          
        
        crudDb.findSpace(spaceId, function(err,spData){
            if(err) return log.error(err);
            var request = text;
            
            log.info('conversation.hears : '+request);
            if(!spData) return(spaceId+ " is undefined");
            if(spData.conversationState.conversation === 'newCart') {
                if(request === "cancel"){ bot.say("Request cancelled");
                    return spData.updateConversationState({conversation:'commands', state: null});
                }
                log.info("conversation.hears : newCart thread...." + spData.setup);
                switch (spData.conversationState.state) {
                    case null:
                        log.info("conversation.hears : ......part 1" + spaceId);
                        return convoNewCart.convo1(request, bot, trigger, spData);
                    case "1":
                        log.info("conversation.hears : ......part 2" + spaceId);
                        return convoNewCart.convo2(request, bot, trigger, spData);
                    case '2':
                        log.info("conversation.hears : ......part 3" + spaceId);
                        return convoNewCart.convo3(request, bot, trigger, spData);
                    case '3':
                        log.info("conversation.hears : ......final complete." + spaceId);
                        return convoNewCart.convo4(request, bot, trigger, spData);
                    default:
                        return;
                }
            }


            switch (true) {
                case (/(^| )\/hello( |.|$)/).test(request):
                    return convoFunc.hello(text, bot, trigger);
                case (/(^| )\/help( |.|$)/).test(request):
                    return convoFunc.help(bot);
                case (/(^)help( |.|$)/).test(request):
                    return convoFunc.help(bot);
                case (/(^| )\/newCart( |.|$)/).test(request):
                    return convoFunc.newCart(text, bot, trigger, spData);
                case (/(^| )\/deleteEndpoint( |.|$)/).test(request):
                    return convoFunc.deleteEndpoint(text, bot, trigger, spData);
                case (/(^| )\/bulkUpload( |.|$)/).test(request):
                    return convoFunc.bulkUpload(text, bot, trigger, spData);
                case (/(^| )\/offlineReport( |.|$)/).test(request):
                    return convoFunc.offlineEndpointReport(text, bot, trigger, spData);
                case (/(^| )\/findEndpoint( |.|$)/).test(request):
                    return convoFunc.findEndpoint(text, bot, trigger, spData);
                case (/(^| )\/release( |.|$)/).test(request):
                    return convoFunc.release(bot);
                case (/(^| )\/reset( |.|$)/).test(request):
                        return convoFunc.reset(text, bot, trigger, spData);
                case (/(^| )\/who( |.|$)/).test(request):
                        return convoFunc.who(bot);
                case (/(^| )\/settings( |.|$)/).test(request):
                        return convoFunc.settings(bot, spData);
                case (/(^| )\/broadcast( |.|$)/).test(request):
                        return convoFunc.broadcast(flint.bots, text, bot, trigger);
                case (/(^| )\/commands( |.|$)/).test(request):
                        return convoFunc.commands(bot);
                case (/(^| )\/adminCommands( |.|$)/).test(request):
                        return convoFunc.adminCommands(bot);
                case (/(^| )\/presenceCommands( |.|$)/).test(request):
                    return convoFunc.presenceCommands(bot);
                case (/(^| )\/feedback( |.|$)/).test(request):
                        return convoFunc.feedback(text, bot, trigger, spData);
                case (/(^| )\/spaceCount( |.|$)/).test(request):
                        return convoFunc.spaceCount(flint.bots.length, bot, trigger);
                case (/(^| )\/spaceID( |.|$)/).test(request):
                        return convoFunc.spaceID(bot, trigger);
                case (/(^| )\/lookup( .|$)/).test(request):
                        return convoFunc.lookup(4, text, bot, trigger);
                case (/(^| )\/lookup6( .|$)/).test(request):
                        return convoFunc.lookup(6, text, bot, trigger);
                case (/(^| )\/resolve(.)/).test(request):
                        return convoFunc.resolve(text, bot, trigger);
                case (/(^| )\/xmpp(.)/).test(request):
                        return convoFunc.xmpp(text, bot, trigger);
                case (/(^| )\/s4b(.)/).test(request):
                        return convoFunc.s4b(text, bot, trigger);
                case (/(^| )\/expressway(.)/).test(request):
                        return convoFunc.expressway(text, bot, trigger);
                case (/(^| )\/scan( |.|$)/).test(request):
                        return convoFunc.scan(text, bot, trigger);
                case (/(^| )\/expscan( |.|$)/).test(request):
                        return convoFunc.scanExpress(text, bot, trigger);
                case (/(^| )\/printrecords( |.|$)/).test(request):
                        return convoFunc.printRecords(text, bot, trigger);
                default:
                    convoFunc.finalChoice(text, bot, trigger);
            }
        });
            
    });
    
    return flint;
};
