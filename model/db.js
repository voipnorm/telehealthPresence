var log = require('../svrConfig/logger');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/presenceDB');


db.on('error', function(err){
    log.error("DB Connection Failure: "+err)
});
db.once('open', function() {
   log.info('Successfully connected to MongoDB!!');
});