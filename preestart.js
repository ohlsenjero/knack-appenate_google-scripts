function myFunction() {
   
  var rawSS = SpreadsheetApp.openById("16rp..............................")
  var rawSheet = rawSS.getSheetByName("Sheet1"); //loads sheet 1
  var rawData = rawSheet.getDataRange().getValues(); // gets all values in 2d array
 

  //Logger.log("RAW DATA = "+rawData);
  //Logger.log("RAW DATA.length = "+rawData.length);
  //Logger.log("RAW SHEET.length = "+rawSheet.length);
 
  var atendees = [];
  var supervisor;
  var jobID;
  var completed;
  var timeStart;
 
  if(rawData.length>1){
    var rawHeaders = rawData[0];
   
   
    for(var i=1;i<rawData.length;i++){
   
      var  currentLine=rawData[i];
     
      /// if/else necessary, since every other atendee will come under a new line with all other columns empty
      //                                                                                    which would give this an empty value.

      if(rawData[0][rawHeaders.indexOf("jobSupervisor")] == ""){
        supervisor = "";
      }else if(currentLine[rawHeaders.indexOf("jobSupervisor")] != "" && i !=0){
       
        supervisor = currentLine[rawHeaders.indexOf("jobSupervisor")];
      }else if(currentLine[rawHeaders.indexOf("jobSupervisor")] == "" && currentLine[rawHeaders.indexOf("jobSelect")] == ""){
        supervisor= supervisor;

      }else if(currentLine[rawHeaders.indexOf("jobSupervisor")] == "" && currentLine[rawHeaders.indexOf("jobSelect")] !=""){
        supervisor = "";
      }
     
     
     
      if(currentLine[rawHeaders.indexOf("jobSelect")] != ""){
       
        jobID = currentLine[rawHeaders.indexOf("jobSelect")];
      }else{
        jobID= jobID;
      }
     
      if(currentLine[rawHeaders.indexOf("Completed")] != ""){
       
        completed = currentLine[rawHeaders.indexOf("Completed")];
      }else{
        completed= completed;
      }

      atendees.push({staffID: currentLine[rawHeaders.indexOf("atendeeID")], jobID:jobID, completed:completed, supervisor:supervisor});
     
 
    }
   
  }


         
    for(var i=0;i<atendees.length;i++){
     
      Logger.log("ATENDEE :  " +atendees[i].staffID);
      Logger.log("JOB :  " +atendees[i].jobID);
      Logger.log("Superv :  " +atendees[i].supervisor);
      Logger.log("Superv :  " +atendees[i].completed);
     
      var startTime = Utilities.formatDate(new Date(atendees[i].completed), "NZ", "HH:mm:ss a");
     
      var dateStart = Utilities.formatDate(new Date(), "NZ", "yyyy-MM-dd");
      var hours= Utilities.formatDate(new Date(atendees[i].completed), "NZ", "H");
      var minutes= Utilities.formatDate(new Date(atendees[i].completed), "NZ", "mm");
      var amPm= Utilities.formatDate(new Date(atendees[i].completed), "NZ", "a");
     
      Logger.log("START DATE : " +dateStart);
     
      var startTimePost = {
        "hours": hours,
        "minutes": minutes,
        "am_pm": amPm
      }
     
     
      postCloseOfDay(atendees[i].staffID, atendees[i].jobID, atendees[i].supervisor, startTimePost);
    
     
    }    
 
 
 
  function postCloseOfDay(staffID, jobID, supervisor, startTime){
   
    var payload = {
      field_233: dateStart,
      field_232: jobID,
      field_239: 'open',
      field_236: staffID,
      field_234: startTime,
      field_235: "",
      field_238: supervisor
    };
   
    Logger.log(payload.field_238);
   
    var url = 'https://api.knack.com/v1/objects/object_20/records/';  
   
    var params = {
      method: 'post',
      headers : {
        'X-Knack-Application-ID': 'fhdjfhjdfhjdfhjdf',
        'X-Knack-REST-API-Key':'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
        'content-type':'application/json'
      },
      payload: JSON.stringify(payload)
    }
   
    var response   = UrlFetchApp.fetch(url, params);  
   
    Logger.log(" CLOSE OF DAY RECORD ADDED" +response);
   
    return response.getContentText();
  }
 
 
 
  /// NOW POST Appenate Timesheet..
  function updateRecordsAppenate(id, number, staff){

  var jobID =id.toString();
  var jobNumber = number;
  var staff = staff;
  var status= 'open';
 
  var body = {
    "Id": "503393ddddddddddddd",
    "NewRows": [[staffID, name, 'Signed Out', '', '', 'Yes', '','', timeID]],
    "CompanyId": 555555,
    "IntegrationKey": "dfdfdfdfdfdfsssssss"
  };
 
 
  var options = {
    'method' : 'put',
    'payload' : JSON.stringify(body),
    'contentType' : 'application/json'
  };
 
  var url="https://manager.easyforms.co.nz:PORT/api/v2/datasource"
  var response=UrlFetchApp.fetch(url, options);
  Logger.log(response)  
}
 

 
//  
  for (var i = rawData.length; i>1; i--) {
    rawSheet.deleteRow(i);
  }

    /// > 1 !!!  because its working its way backwards from rawData.length
    ///                            which means length.1 == 0.
   
    /// watch out for this!!  before it was deleting the first ROw also
    // but then the next upload would fail
    // for some reason the first ever upload doesn't need it, but the next ones
    // will crash unless that first Row, with the Filed names, is there.

 
}
