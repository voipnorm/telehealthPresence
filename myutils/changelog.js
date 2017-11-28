var changeLog = 
"10-May-2017 Bot is created.<br>"+
"10-May-2017 Features DNS lookup, Port scanning, Website monitoring added.<br>"+
"10-May-2017 Expressway lookup and port scan added.<br>"+
"10-May-2017 Expressway print SRV records added.<br>"+
"11-May-2017 Enhanced formatting added.<br>"+
"end."

exports.printChangeLog = function(callback){
    callback(changeLog)
};

var roadMap = 
"2017 - ";

exports.printRoadmap = function(callback){
    callback(roadMap)
};