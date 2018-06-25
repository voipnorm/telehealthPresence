"use strict";

var log = require('../svrConfig/logger');
var crud = require('../model/appController');
//setup conversation file
module.exports = {
    //Welcome conversation flow
    convo1: function(request, bot, trigger, spData){
        bot.say("Please enter the IP Address of the cart you would like presence updates for.");
        spData.conversationState.conversation = "newCart";
        spData.conversationState.state = "1";
        spData.conversationState.cartName = request;
        return;
    },
    convo2: function(request, bot , trigger, spData){
        bot.say("Please enter the JID address of the cart.");
        spData.conversationState.state="2";
        spData.conversationState.ipAddress = request;
        return;
    },
    convo3: function(request, bot , trigger, spData){

        spData.conversationState.state="3";
        spData.conversationState.JID = request;

        return bot.say({markdown:"Your setup is nearly complete. If you would like to commit these changes just type **yes**, if not type **no**."});
    },
    convo4: function(request, bot , trigger, spData){
        log.info("conversationSetup.setupConvo4 :"+ JSON.stringify(spData.conversationState));

        if(request === "yes") {
            var cart =
                {
                    cartName:spData.conversationState.cartName,
                    cartIP: spData.conversationState.ipAddress,
                    JID: spData.conversationState.JID
                };
            crud.createCart(cart, function(){
                spData.updateConversationState({conversation: "commands", state:""});
                return bot.say({markdown: "Thank you, your setup is now complete."});
            })
        }else if(request === "no"){
            spData.updateConversationState({conversation: "commands", state:""});
            return bot.say({markdown: "Your new cart has been cancelled. To start over please enter **/newCart**."});
        }else {
            bot.say("Oh no, something went wrong. Lets try this again." +
                " Please enter yes or no");
            return;
        }
    }
};