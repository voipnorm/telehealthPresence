var dns = require('dns');
var _=require('lodash');
var prettyjson = require('prettyjson');
var portscanner = require('portscanner');
var Promise = require('bluebird');
var url = require('url');
var validUrl = require('valid-url');
var log = require('../svrConfig/logger');

module.exports = function(){
    
    function lookup(domain,options,cb){
        dns.lookup(domain, options, function(err,address, family){
            if(err) {
                log.error("netTools.lookup :"+err)
                return cb("There was an issue with "+domain+". Please try again or a different domain.")
            };
            
            if(_.isArray(address)) return cb(parseLookup(domain,address));
            
            return cb('**address**: '+address+'<br>**family**: IPv'+family);
        });
    }
    //resolve multiple DNS types
    function resolve(domain,rrtype,cb){
        dns.resolve(domain,rrtype, function(err,response){
            if(err) {
                log.error("netTools.resolve :"+err)
                return cb("There was an issue with "+domain+". Please try again or a different domain.")
            };
            var text = parseReturn(domain, response)
                        .replace(/_/g,'&#717;')
                        .trim();
            cb(text);
        });
    }
    function parseLookup(domain, data){
        try{
            var portStatus;
            var response = data, responseText;
            log.info("netTools.parseLookup :"+response);
            if(!_.isArray(response))return response;
            responseText = `**Domain Record**: ${domain}\n\n`;
            
            for (var i = 0; i < response.length; i += 1) {
                if(!_.isObject(response[i])) {
                    responseText += `${i+1}. ${response[i]}\n`;
                }else{
                    responseText += `${i+1}. **Address**:${response[i].address} **Family**: ${response[i].family}\n `;
                    
                }
            }
            responseText = responseText.replace(/{|}|"/g,'');
            log.info("netTools.parseLookup : "+responseText)
            return responseText;
        }catch(e){
            log.info("netTools.parseLookup :"+e);
        }
        
        
    }
    function express(records, cb){
        var pendingJobCount = records.length, recordtxt = [];
        var norecordtxt = [];
        _.forEach(records, function(record){
            log.info("netTools.express :"+record);
            dns.resolve(record,'SRV',function(err, response){
                if(err) {
                    log.info("netTools.express :"+err);
                    var error ="There was no record for **"+record+'**<br>';
                    norecordtxt.push(error);
                    --pendingJobCount;
                }else{
                    var responseText = parseReturn(record, response)
                    recordtxt.push(responseText);
                    --pendingJobCount
                }
               if(pendingJobCount === 0 ){
                    var desStg = norecordtxt.toString()
                        .replace(/\[/g, '')
                        .replace(/\]/g, '')
                        .replace(/,/g, '')
                        .replace(/_/g,'&#717;')
                        .trim();
                    var desStg1 = recordtxt.toString()
                        .replace(/\[/g, '')
                        .replace(/\]/g, '')
                        .replace(/,/g, '')
                        .replace(/_/g,'&#717;')
                        .trim();
                    var finaltxt = desStg+'\n'+desStg1+'\n\n';
                    return cb(finaltxt);
                    } 
            })
        })
    }
    
    function reverse(ip,cb){
        dns.reverse(ip, function(err,response){
            if(err) throw(err);
            cb(response);
        })
    }
    function parseReturn(domain, data){
        try{
            var portStatus;
            var response = data, responseText;
            log.info("netTools.parseReturn : "+response);
            if(!_.isArray(response))return response;
            responseText = `**SRV Record**: ${domain}\n\n`;
            
            for (var i = 0; i < response.length; i += 1) {
                if(!_.isObject(response[i])) {
                    responseText += `${i+1}. ${response[i]}\n`;
                }else{
                    responseText += ` - **Name**: ${response[i].name} **Port**: ${response[i].port} **Priority**: ${response[i].priority} **Weight**: ${response[i].weight}\n\n`;
                    
                }
            }
            responseText = responseText.replace(/{|}|"/g,'');
            log.info("netTools.parseReturn :"+responseText);
            return responseText;
        }catch(e){
            log.error("netTools.parseReturn :"+e);
        }
        
        
    }
    //scan port along with resolve DNS
    function scanExpress(records,cb){
        processScanExp(records)
        .then(function(array){
            return processFinaltxt(array)
        })
        .then (function(result){
            cb(result)
        }).catch(function(err){
            log.error("netTools.scanExpress : "+err);
        });
        
    }
    function processScanExp(records){
        return new Promise(function(resolve, reject){
            var counter1 = records.length;
            var recordtxt = [],
            norecordtxt = [];
            _.forEach(records, function(record){
                log.info("netTools.processScanExp : "+record);
                resolveDNS(record)
                .then(function(response){
                    //if(response.length>1) ++counter1;
                    if(response.error){
                        norecordtxt.push(response.error)
                        return processError(response.error);
                    }else{
                        log.info("netTools.processScanExp respknse length:"+response.length);
                        return processDns(response,record);
                    }
                })
                .then(function(responseText){
                    if(responseText==="error"){
                        log.error("netTools.processScanExp SRV didn't exist");
                    }else{
                        recordtxt.push(responseText);
                    }
                    
                    log.info("netTools.processScanExp :"+counter1);
                    if(--counter1===0){
                        resolve([norecordtxt, recordtxt]);
                    }
                })
                .catch(function(err){
                    log.error("netTools.processScanExp : "+err);
                })
                
                
            });
        });
    }
    function processError(error){
        return new Promise(function(resolve, reject){
            resolve("error")
        })
    }
    function resolveDNS(record){
        return new Promise(function(resolve, reject){
            dns.resolve(record,'SRV',function(err, response){
                    if(err) {
                        log.error("netTools.resolveDNS :"+err)
                        var error = {error: "There was no record for **"+record+"**.<br>"};
                        resolve(error);
                    }else{
                       resolve(response); 
                    }
            })
        })
    }
    function processDns(response,record){
        return new Promise(function(resolve, reject){
            var recordtxt = [];
            var counter = response.length;
            _.forEach(response, function(txt){
                log.info("netTools.processDNS :"+txt);
                scan(txt.port, txt.name)
                .then(function(status){
                    return parseScan(record, txt, status)
                }).then(function(record){
                    recordtxt.push(record)
                    if(--counter===0){
                        resolve(recordtxt);
                    }
                     
                })
                .catch(function(e){
                    log.error("netTools.processDNS :"+e); 
                });   
                
            });
        });
        
    }
    function processFinaltxt(array){
        return new Promise(function(resolve, reject){
            var desStg = array[0].toString()
                        .replace(/\[/g, '')
                        .replace(/\]/g, '')
                        .replace(/,/g, '')
                        .replace(/_/g,'&#717;')
                        .trim();
                var desStg1 = array[1].toString()
                        .replace(/\[/g, '')
                        .replace(/\]/g, '')
                        .replace(/,/g, '')
                        .replace(/_/g,'&#717;')
                        .trim();
                var finaltxt = desStg+'\n'+desStg1+'\n\n'+
                '**Note**: UDP ports will reflect closed as test is **TCP only**.';
                resolve(finaltxt);
        });
        
    }
    function parseScan(domain, txt,status){
        return new Promise(function(resolve, reject){
           try{
                var response = {
                    Record : domain,
                    Name : txt.name,
                    Port : txt.port,
                    Status : status.replace(/"/g,'')
                
                };
                log.info("netTools.parseScan : "+response);
                var responseText;
                responseText = `**SRV Record**: ${response.Record}\n\n - **Name**: ${response.Name} **Port**: ${response.Port} **Status**: ${response.Status}\n\n`;
                responseText = responseText.replace(/{|}|"/g,'');
                resolve(responseText);
            }catch(e){
                log.error("netTools.parseScan :"+e);
                reject(e);
            } 
        });
    }
    //opens then closes tcp socket
    function scan(port, address){
        return new Promise(function(resolve, reject){
            portscanner.checkPortStatus(port, address, function(error, status) {
                // Status is 'open' if currently in use or 'closed' if available
                if(error) reject(error);
            
                log.info("netTools.scan :"+status);
                return resolve(JSON.stringify(status));
            });
        });
        
        
    }
    function scanPort(port, address, cb){
        
            portscanner.checkPortStatus(port, address, function(error, status) {
                // Status is 'open' if currently in use or 'closed' if available
                if(error) log.error("netTools.scanPort : "+error);
            
                log.info("netTools.scanPort : "+status);
                return cb(JSON.stringify(status));
            });
        
        
        
    }
    //parse website URL
    function parseURL(urlTxt, cb){
        if(!validUrl.isWebUri(urlTxt)) return cb("URL is invalid, please try again.");
        var parseObj = url.parse(urlTxt);
        var  txtResponse = `**Slashes**: ${parseObj.slashes}\n\n**Auth**: ${parseObj.auth}\n\n**Host**: ${parseObj.host}\n\n**Hostname**: ${parseObj.hostname}\n\n**Hash**: ${parseObj.hash}\n\n**Search**: ${parseObj.search}\n\n**Query**: ${parseObj.query}\n\n**Pathname**: ${parseObj.pathname}\n\n**Path**: ${parseObj.path}\n\n**href**: ${parseObj.href}\n\n`
                            
        return cb(txtResponse);
    }
    
    return {
        parseURL: parseURL,
        scanExpress: scanExpress,
        scanPort: scanPort,
        express: express,
        lookup: lookup,
        resolve: resolve,
        reverse: reverse,
    };
}();