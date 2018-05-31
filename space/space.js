var mongoose = require('mongoose');
var SpaceSchema = new mongoose.Schema({
    "spaceId" : String,
    "spaceActive" : String,
    "setup" : String,
    "dnsServer" : String,
    "conversationState" : {"conversation": String},
    "webUrls": String

});
mongoose.model('Space', SpaceSchema);

module.exports = mongoose.model('Space');