# ChatBot Monitor Bot

ChatBot Monitor Bot Bot is a chatbot netowrk monitoring bot designed for Cisco Spark. 
This bot is meant for admins to track and troubleshoot their chat bot deployments, not an end user chat bot.
This bot is solely driven by commands.

## Getting Started

ChatBot Monitor Bot is meant to be a base to which to build. Although it does not use a database for storing 
space data adding one should be as simple of replacing the crud file with your own database methods.

ChatBot Monitor Bot uses a json file to store a limited set of space data which is loaded on startup and rewriten on new space adds and removals.
Its simple but limited. <example.json> is a blank JSON file meant as a placeholder for space.json to be built.

### Prerequisites

Nodejs, node-flint.

Monitored bots require the ability to respond to http requests.Express example below:

```javascript
app.get('/monitor', function (req, res) {
  var roomCount = flint.bots.length;
  var json_response = {
    'name':'Bot being monitored',
    'roomCount': roomCount
  };
  res.status(200).json(json_response);
  res.end();
});
```

### Installing

#### Via Git
```bash
mkdir myproj
cd myproj
git clone https://github.com/voipnorm/nodeMonV2.git
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
```
## Built With

* [node-flint](https://github.com/flint-bot/flint) - The bot framework used

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Nick Marus node-flint creator.

## Flint Support

Chat with us here:[flint-support](https://eurl.io/#rkwLEq4fZ)