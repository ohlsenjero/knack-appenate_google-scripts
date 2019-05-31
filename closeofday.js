function myFunction() {
   
  var rawSS = SpreadsheetApp.openById("1ivv1r75J7Qk_extrYqTRAi9f-5eB50LlidpXXSuUj2A")
  var rawSheet = rawSS.getSheetByName("Sheet1"); //loads sheet 1
  var rawData = rawSheet.getDataRange().getValues(); // gets all values in 2d array
  //Logger.log("RAW DATA = "+rawData);
  //Logger.log("RAW DATA.length = "+rawData.length);
  //Logger.log("RAW SHEET.length = "+rawSheet.length);
 
 
  var recordID;
  var atendeesAllUnsorted = [];
  var atendeesAll = [];
  var allStaff;
  var atendeesSep = [];
  var jobID;
  var photo;
  var timeAll;
  var alreadyProcessed=[];
 
  if(rawData.length>1){
    var rawHeaders = rawData[0];
   
    for(var i=1;i<rawData.length;i++){

      var currentLine=rawData[i];
     
     
     
      if(currentLine[rawHeaders.indexOf("jobSelect")] != ""){  
        jobID = currentLine[rawHeaders.indexOf("jobSelect")];
      }else if(currentLine[rawHeaders.indexOf("repJobID")] != ""){
        jobID= currentLine[rawHeaders.indexOf("repJobID")];
      }else{
        jobID= jobID;
      }
     
     
         
       
         
         
         
       
       
     

     

     
     
     
     
     
      if(rawData[0][rawHeaders.indexOf("photo")] == ""){
        photo = "";
      }else if(currentLine[rawHeaders.indexOf("photo")] != "" && i !=0){
       
        photo = currentLine[rawHeaders.indexOf("photo")];
      }else if(currentLine[rawHeaders.indexOf("photo")] == "" && currentLine[rawHeaders.indexOf("jobSelect")] == ""){
        photo = photo;          
        Logger.log(photo);
       
      }else if(currentLine[rawHeaders.indexOf("photo")] == "" && currentLine[rawHeaders.indexOf("jobSelect")] !=""){
        photo = "";
      }
     
     
      if(currentLine[rawHeaders.indexOf("getAllStaff")] != ""){  
        allStaff = currentLine[rawHeaders.indexOf("getAllStaff")];
       
        if(currentLine[rawHeaders.indexOf("repJobID")] != ""){  
          jobID = currentLine[rawHeaders.indexOf("repJobID")];
        }else{
          jobID= currentLine[rawHeaders.indexOf("jobSelect")];
        }
       
          timeAll = currentLine[rawHeaders.indexOf("timeAll")];
         
          var hours2= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("timeAll")]), "NZ", "H");
          var minutes2= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("timeAll")]), "NZ", "mm");
          var amPm2= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("timeAll")]), "NZ", "a");
         
          var endTimePostAll = {
            "hours": hours2,
            "minutes": minutes2,
            "am_pm": amPm2
          }
         
          ////  need to slice() too, as first value in allStaff array will be empty, due to staffID list starting with "|", like this: |1|2|3
          atendeesAllUnsorted.push({all: allStaff.split("|").slice(1), jobID: jobID, time: endTimePostAll, photo: photo});
         
        }//IF getAllStaff
     
   
        if(currentLine[rawHeaders.indexOf("atendeeID")]){
       
          var hours= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("time")]), "NZ", "H");
          var minutes= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("time")]), "NZ", "mm");
          var amPm= Utilities.formatDate(new Date(currentLine[rawHeaders.indexOf("time")]), "NZ", "a");
         
          var endTimePost = {
            "hours": hours,
            "minutes": minutes,
            "am_pm": amPm
          }
         
          atendeesSep.push({staffID: currentLine[rawHeaders.indexOf("atendeeID")], endTime: endTimePost, jobID: jobID, photo:photo });
        }
       

       

     
     
     
    }//FOR rawData
   
   

    for(var r = 0; r < atendeesAllUnsorted.length; r++){
      for(var k = 0; k < atendeesAllUnsorted[r].all.length; k++){
       
        atendeesAll.push({staffID: atendeesAllUnsorted[r].all[k], jobID: atendeesAllUnsorted[r].jobID, time: atendeesAllUnsorted[r].time, photo: atendeesAllUnsorted[r].photo});
        //Logger.log("FFFFFFFFFFFFFFFFFFFFFFFFFF =  " + atendeesAllUnsorted[r].all[k]);
      }//FOR atendeesAllUnsorted[r].alll
    }//FOR atendeesAllUnsorted
  }
   
 
 
 
  ///////////////////////////////////////
  // GET Timesheet records --> Match WHERE Job == JobID
  // \
  //  grab record[i].id
 
  function getRecordID(staffID, jobID){
    var filesList=[]
   
    //var numOfResults=1 //max 1000
    var headers = {
      'X-Knack-Application-Id': '571015bcb799d9fc79e4741e',
      'X-Knack-REST-API-Key': '907e7960-0291-11e6-a726-7de2e9f17f31'
    };
   
    var filters = {
      'match': 'and',
      'rules':
      [
        {
          field: 'field_236', ///Staff connection
          operator: 'is',
          value: staffID
        },
        {
          field: 'field_232', ///Job connection
          operator: 'is',
          value: jobID
        },
        {
          field: 'field_239', ///Status
          operator: 'is',
          value: 'open'
        }
      ]
    };
   
    var url = 'https://api.knack.com/v1/objects/object_20/records?rows_per_page='+40;
    url =url+ ('&filters=' + encodeURIComponent(JSON.stringify(filters)))
    var options = {
      'method': 'get',
      'headers': headers
    };
    var response = UrlFetchApp.fetch(url, options);
   
    var data = JSON.parse(response.getContentText());
   
   
   
    return (data)
  }  
 
 

    // PROCESS SEPARATE TIMES' ATENDEES
    for(var i=0;i<atendeesSep.length;i++){
     
      Logger.log("HOW MANY SEP?? " +atendeesSep.length);
     
      var recordData = getRecordID(atendeesSep[i].staffID, atendeesSep[i].jobID);
     
      for(var e = 0; e< recordData.records.length; e++){

        if(atendeesSep[i].jobID == recordData.records[e].field_232_raw[0].id){

           alreadyProcessed.push({staffID:atendeesSep[i].staffID, jobID: atendeesSep[i].jobID});
         
           //Logger.log("ID" +atendeesSep[i].staffID + "JOB" + atendeesSep[i].jobID);
           postCloseOfDay(atendeesSep[i].staffID, atendeesSep[i].endTime, recordData.records[e].id, atendeesSep[i].photo);
 
        }//IF atendee_jobID==jobID

      }// FOR recordData

    }// FOR atendees
   
 
 
  /// POST ALL ATENDEES -> minus the ones processed above: Separate times
   for(var i=0;i<atendeesAll.length;i++){
      Logger.log("staff ID? "+atendeesAll[i].staffID);
      Logger.log("job ID? "+atendeesAll[i].jobID);
     
     
     
      var recordData = getRecordID(atendeesAll[i].staffID, atendeesAll[i].jobID);
     
      Logger.log("HOW MNY ATENDEES??? " +i + " ----" + atendeesAll[i].staffID + "==" +atendeesAll[i].jobID);
     
      for(var e = 0; e< recordData.records.length; e++){
       
        if(atendeesAll[i].jobID ==recordData.records[e].field_232_raw[0].id){
         
          var thereAlready=false;
          if(alreadyProcessed.length >= 1){
           
           
            /// which ones were done above? (atendeesSep)
            for(var j=0; j< alreadyProcessed.length; j++){
              //this ones
              Logger.log("ALREADY JOB ID?? " +alreadyProcessed[j].jobID);
              Logger.log("ALREADY STAFF ID?? " +alreadyProcessed[j].staffID);
             
              if(!thereAlready){
                if(atendeesAll[i].staffID == alreadyProcessed[j].staffID && atendeesAll[i].jobID == alreadyProcessed[j].jobID){
                 
                  thereAlready=true;
                }else if(atendeesAll[i].staffID == alreadyProcessed[j].staffID && atendeesAll[i].jobID != alreadyProcessed[j].jobID){
                  thereAlready=false;
                }
               
              }
            }//FOR alreadyProcessed
          }//IF alreadyProcessed
         
         
          if(!thereAlready){
            postCloseOfDay(atendeesAll[i].staffID, atendeesAll[i].time, recordData.records[e].id, atendeesAll[i].photo);
            Logger.log('POSTED    '+atendeesAll[i].staffID);
          }else{
            Logger.log('NOT POSTED    '+atendeesAll[i].staffID);
          }
         
        }// IF staff ID & job ID

      }// FOR recordData

    }// FOR atendees
 

 
 
 
 
  function postCloseOfDay(staffID, endTime, recordID, photoUpload){
   
    //Logger.log("recordID" + recordID);
   
    var payload = {
      field_239: 'closed',
      field_235: endTime,
      field_240: photoUpload
    };
   
    Logger.log(payload.field_238);
   
    var url = 'https://api.knack.com/v1/objects/object_20/records/'+recordID;  
   
    var params = {
      method: 'put',
      headers : {
        'X-Knack-Application-ID': '571015bcb799d9fc79e4741e',
        'X-Knack-REST-API-Key':'907e7960-0291-11e6-a726-7de2e9f17f31',
        'content-type':'application/json'
      },
      payload: JSON.stringify(payload)
    }
   
    var response   = UrlFetchApp.fetch(url, params);  
   
    Logger.log(" CLOSE OF DAY RECORD ADDED" +response);
   
    return response.getContentText();
  }
 
 
 
 
///DONE processing, delete Sheet Rows

  for (var i = rawData.length; i>1; i--) {
    rawSheet.deleteRow(i);
  }
   /// > 1 !!!  because its working its way backwards from rawData.length
    /// which means length.1 == 0.
   
    /// and ">" because if you delete the first row, the upload crashes (some sort of connection being established there)
    // because for some reason the first ever upload doesn't need that first row,
    // but once set up, the next ones will crash unless that first Row, with the Filed names, is still there.

 
}