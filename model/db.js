var log = require('../svrConfig/logger');
var myutils = require('../myutils/myutils');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/presenceDB');


db.on('error', function(err){
    log.error("DB Connection Failure: "+err);
    myutils.sparkPost("DB Connection Failure: "+err, process.env.SPARK_ROOM_ID)
});
db.once('open', function() {
   log.info('Successfully connected to MongoDB!!');
});