# Telehealth Presence Application

A mix of Webex Teams chatbot and XMPP application, TPA allows additional XMPP presence states for Cisco video codecs inside of a Jabber XMPP environment.

There are a number of components to this application:
* XMPP account registration for telehealth carts
* Webex Teams chat bot to do reporting and control of application(bulk uploads and application troubleshooting)
* Tracking availability of video endpoint administration pages to verify endpoint availability for enhanced presence status
* Poll video endpoints API for people presence and other information such as DND.
* Automatically update IP changes from CUCM using MAC information.
* MongoDB backend holds user, endpoint and space collections.
* Web admin interface for adding and removing users and endpoints.
* REST API service that allows administration and publish endpoint status.  
All pieces work together to create an application that can add additional presence states for video endpoints similar to Cisco Movi.

[![Jabber Endpoint presence](/img/jabberPresence.png?raw=true)]

## Getting Started

The following applications and hardware are required:

* Cisco Unified Communications Manager
* Cisco Presence Server
* Cisco Video endpoint
* Cisco Webex Teams
* Nodejs
* MongoDb

### Prerequisites

Configuration required:

* Video endpoint registration in CUCM
* CUCM end user account enabled for Presence Server for each video endpoint
* Endpoint and end user accounts paired with each other within CUCM
* Cisco Webex Teams Bot account
* Cisco Webex Teams Space ID to send application messages.
* DNS FQDN videoPresence.<your domain>:3001 eith via DNS record or host record.
* install and configure Nodejs and MongoDb

### Installing

#### Via Git
```bash
mkdir myproj
cd myproj
git clone https://github.com/voipnorm/telehealthPresence.git
npm install
```

Set the following environment variables...

```
SPARK_ROOM_ID=<admin room ID for feedback>
SPARK_BOT=<bot access token>
WEBPORT=8080
NODE_ENV=development
SPARK_BOT_STRING= <bot texted string>
ALLOW_DOMAIN= <authorised dmain>
APP_ADMIN= <admin email> 
XMPPSERVER=<your presence server>
XMPPCARTPWD=<video cart PWD>
TPADMIN=<Telepresence endpoint admin Username>
TPADMINPWD=<TP Admin password>
SECRETTOKEN=<admin application secret phrase>
WEBADMIN=<Application Admin User name>
WEBADMINPWD=<Application Admin Password>
WEBADMINTOKEN=<Admin secret token>
CUCMPRESENCEACCOUNT=<CUCM server account>
CUCMPRESENCEPWD=<CUCM server password>
CUCMIPADDRESS=<CUCM IP Address>
CUCMVERSION=<CUCM version>
```
Despcription of variables:
* SPARK_ROOM_ID => Webex Teams room ID used for error notification and and system messages
* SPARK_BOT => Bot token used for direct interaction with application bot. Bot command capable.
* WEBPORT => port used by flint framework to create websocket with Spark service.
* NODE_ENV => development or production
* SPARK_BOT_STRING => String used to identify bot in @ mentions from Spark 
* ALLOW_DOMAIN => security setting to define your companies domain.
* APP_ADMIN => admins Webex Teams ID
* XMPPSERVER => XMPP/CUPS server ip address
* XMPPCARTPWD => admin password for telehealth cart. Can also be specified in cart.json

## Built With

* [node-flint](https://github.com/flint-bot/flint) - The bot framework used

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Nick Marus node-flint creator.

## Flint Support

Chat with us here:[flint-support](https://eurl.io/#rkwLEq4fZ)