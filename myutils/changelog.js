var changeLog = 
    "1-Jan-2018 App is created.<br>"+
    "26-June-2018 API with JOSN Web Tokens.<br>"+
    "26-June-2018 Mongo DB support.<br>"+
    "26-June-2018 Webex Teams Chat bot support.<br>"+
    "26-June-2018 Support for People presence and People count.<br>"+
    "26-June-2018 CSV upload via chatbot support.<br>"+
    "26-June-2018 Web admin interface.<br>"+
    "end."

exports.printChangeLog = function(callback){
    callback(changeLog)
};

var roadMap = 
"2018 - Undefined ";

exports.printRoadmap = function(callback){
    callback(roadMap)
};