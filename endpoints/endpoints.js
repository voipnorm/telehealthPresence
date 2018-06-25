var mongoose = require('mongoose');
var EndpointSchema = new mongoose.Schema({
    cartName: String,
    xmppJID: String,
    xmppServer: String,
    cartIP: String,
    mac: String,
    peopleTest: String,
    location: String,
    version: String,

});
mongoose.model('Endpoint', EndpointSchema);

module.exports = mongoose.model('Endpoint');
