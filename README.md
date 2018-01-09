# Telehealth Presence Application

A mix of Spark bot and XMPP application, TPA allows additional XMPP presence states for CIsco video codecs inside of a Jabber XMPP environment.

There are three components to this application:
* XMPP account registration for telehealth carts
* Spark chat bot to do reporting and control of application(bulk uploads and application troubleshooting)
* Tracking availability of video endpoint administration pages to verify endpoint availability for enhanced presence status

All three pieces work together to create an application that can add additional presence states for video endpoints similar to Cisco Movi.



## Getting Started

The following applications and hardware are required:

* Cisco Unified Communications Manager
* Cisco Presence Server
* Cisco Video endpoint
* Cisco Spark
* Nodejs

### Prerequisites

Configuration required:

* Video endpoint registration in CUCM
* CUCM end user account enabled for Presence Server
* Cisco Spark Bot account


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

```
## Built With

* [node-flint](https://github.com/flint-bot/flint) - The bot framework used

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Nick Marus node-flint creator.

## Flint Support

Chat with us here:[flint-support](https://eurl.io/#rkwLEq4fZ)