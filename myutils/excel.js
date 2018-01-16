//module for reading CSV file downloaded from Spark for uploading bulk TP endpoints - needs work on adding validy of CSV format

var Excel = require('exceljs');
var fs = require('fs');
var workbook = new Excel.Workbook();
var log = require('../svrConfig/logger');
var crud = require('../model/crud');

function readcsv(filename, callback){
    workbook.csv.readFile(filename)
        .then(function(worksheet) {

            for(var i = 0; i<worksheet.actualRowCount+1; i++){
                var row = worksheet.getRow(i+1).values;
                var cart = {
                    cartName: row[1],
                    ipAddress:row[2],
                    JID:row[3],
                    peopleTest:row[4]
                };
                crud.createCart(cart, function(){
                    log.info("excel.readcsv: cart writen to file complete.")
                });

            }
            callback();
        }).catch(function(err){
            log.error(err);
    })



}


function fileWatcher(cb){
    var Dir = "./myutils/csvUploads/";
    fs.readdir(Dir, function(err, file){
        if(err) return log.error(err);
        var filename =  file;

        readcsv("./myutils/csvUploads/"+filename, function(){
            fs.unlink("./myutils/csvUploads/"+filename, function(err){
                if (err) {
                    log.info("failed to delete :"+err);
                    cb()

                } else {
                    log.info('successfully deleted file');
                    cb();

                }
            });
        })

    });


}
exports.fileWatcher = fileWatcher;
