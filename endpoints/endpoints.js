var mongoose = require('mongoose');
var EndpointSchema = new mongoose.Schema({
    cartName: String,
    xmppJID: String,
    xmppPwd: String,
    xmppServer: String,
    cartIP: String,
    endpointPwd: String,
    peopleTest: String,
    location: String,
    version: String,

});
mongoose.model('Endpoint', EndpointSchema);

module.exports = mongoose.model('Endpoint');
