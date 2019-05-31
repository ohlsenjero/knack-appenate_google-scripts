function myFunction() {
  
  
  
  ////  get data from Timesheets object_61
  function getFilesKnack(){
  var filesList=[]
  
  ///  Digger Collective Knack API
  var numOfResults=100; //max 1000
  var headers = {
    'X-Knack-Application-Id': '5c73518ae5c38408560026f7', 
    'X-Knack-REST-API-Key': '26ab6d50-38ac-11e9-ad75-655785f442f9'
  };
  
  var filters = { //Processed is No and logo is true
  'match': 'and',
  'rules': 
    [
      {
        field: 'field_669', //AutoSignOut?  //otherwise, those who were auto signed out from this program
        operator: 'is',  ///                would also appear since they also don't have an 'ending time'
        value: "No"      //                                 field_680== " " <<< iin the for loop below
      }
    ]
  };

  var url = 'https://api.knack.com/v1/objects/object_61/records?rows_per_page='+numOfResults;
    url =url+ ('&filters=' + encodeURIComponent(JSON.stringify(filters)))
  var options = {
    'method': 'get',
    'headers': headers
  };
  var response = UrlFetchApp.fetch(url, options);
  
  var data = JSON.parse(response.getContentText());
    

  return (data)
}
  
  
  
  
  ////  get data from Staff object_5
  function getStaffFilesKnack(){
  var filesList=[]
  
  //var numOfResults=1 //max 1000
  var headers = {
    'X-Knack-Application-Id': '5c73518ae5c38408560026f7', 
    'X-Knack-REST-API-Key': '26ab6d50-38ac-11e9-ad75-655785f442f9'
  };
  
  var filters = { //Processed is No and logo is true
  'match': 'and',
  'rules': 
    [
      {
        field: 'field_470', //Status
        operator: 'is',
        value: "Signed In"
      }
    ]
  };

  var url = 'https://api.knack.com/v1/objects/object_5/records?rows_per_page='+40;
    url =url+ ('&filters=' + encodeURIComponent(JSON.stringify(filters)))
  var options = {
    'method': 'get',
    'headers': headers
  };
  var response = UrlFetchApp.fetch(url, options);
  
  var data = JSON.parse(response.getContentText());
    


  return (data)
}    
  
var knackTimesheetData = getFilesKnack();
var knackStaffData = getStaffFilesKnack();    
  

  function getName(input){
    var str = input;
    //var regex = /([>'])(?:(?=(\\?))\2.)*?([<'])/g;
    var regex = />(.*?)</;
    var found = str.match(regex);

    return found[1]; 
  }
  
  
  Logger.log("A VER? :"+knackTimesheetData.records.length);
  
  var notSignedOut = [];
  
  for(var i=0; i<knackTimesheetData.records.length; i++){
    
    Logger.log(knackTimesheetData.records[i].field_679)
    
    if(knackTimesheetData.records[i].field_680== " "||knackTimesheetData.records[i].field_680==undefined||knackTimesheetData.records[i].field_680==""){
//      Logger.log(getFilesKnack().records[i].field_743_raw.unix_timestamp);
//      Logger.log(getFilesKnack().records[i].field_679);
//      Logger.log(getFilesKnack().records[i].field_654_raw.unix_timestamp);
//      Logger.log(getFilesKnack().records[i].field_680);
      
      notSignedOut.push({
                         timesheetID:knackTimesheetData.records[i].id,
                         startTime:knackTimesheetData.records[i].field_743_raw.unix_timestamp,
                         staffName:getName(knackTimesheetData.records[i].field_656)
                       });
    }
    
    
    
   }
  
  //Logger.log(notSignedOut.length);
 
  for(var i=0; i< notSignedOut.length; i++){
      //Logger.log("start Time? "+notSignedOut[i].startTime);
      //Logger.log("Not Signed Out? "+notSignedOut[i].staffName);
    
    Logger.log("timesheet ID? :" +notSignedOut[i].timesheetID);
    
    
    var start = (((((notSignedOut[i].startTime)/1000)/60)/60)-37.01);
    var current = (((Date.now()/1000)/60)/60);
    var staff = notSignedOut[i].staffName;
    
    var logedInTime = current-start;

    Logger.log('JS date');
    Logger.log(current);
    Logger.log('Sign Auck date');
    Logger.log(start);
    Logger.log('----------------');
    Logger.log('time Difference');
    Logger.log(logedInTime);
    Logger.log('__________________');
    
    if(logedInTime< 1 ){
      Logger.log("Logged In for LESS than an hour");
      Logger.log('__________________');
    }else{
      Logger.log("Logged In for MORE than an hour");
      
      /// GET THIS STAFF NAME -> getStaffRecords -> compare this name to the records names....
      
      /// update field 470 (status)
        for(var e=0; e<knackStaffData.records.length; e++){
          
          if(staff == knackStaffData.records[e].field_12){
             Logger.log("FOUND Logged in Staff!!");
             Logger.log(knackStaffData.records[e].field_12);
             Logger.log(knackStaffData.records[e].id);
            
Logger.log( updateRecordsKnack(knackStaffData.records[e].id));
Logger.log( updateRecordsTimesheetKnack(notSignedOut[i].timesheetID));
Logger.log( updateRecordsAppenate(knackStaffData.records[e].id, knackStaffData.records[e].field_12));
            
             //Logger.log(knackStaffData.records[e].id);
            
          }
         
        }
      
    }
    Logger.log('__________________');
  }
  
  
  
  
/// THIS 3 FUNCTIONS BELOW, updateKnack/updateAppenate
// should be triggered together, as part of the same chain....  
  
  ////5c808f943ff771085e8e3f51 = TEST 4 staffID
  
//updateRecordsKnack('5c808f943ff771085e8e3f51');
function updateRecordsKnack(id){ 
  var recordID= id;

  var payload = {
    field_470: 'Signed Out'
  };


  var url        = 'https://api.knack.com/v1/objects/object_5/records/'+ recordID;  
  
  var params = {
    method: 'put', 
    headers : {
      'X-Knack-Application-ID': '5c73518ae5c38408560026f7',
      'X-Knack-REST-API-Key':'26ab6d50-38ac-11e9-ad75-655785f442f9',
      'content-type':'application/json'
    }, 
    payload: JSON.stringify(payload)
  }
  
  
  var response   = UrlFetchApp.fetch(url, params);   
  
  Logger.log(response);
  
  return response.getContentText();
} 
  
//////
  ////  HERE GOES ANOTHER KnackUPDATE ->> Timesheet object(61), //    field_669: 'Yes'
  //                                             Grab Timesheet ID on notSignedOut array!

function updateRecordsTimesheetKnack(id){ 
  var recordID= id;

  var payload = {
    field_669: 'Yes'  //Auto Signed out.. so this one is not pulled at the beginning, despite not having an ending time....
  };


  var url        = 'https://api.knack.com/v1/objects/object_61/records/'+ recordID;  
  
  var params = {
    method: 'put', 
    headers : {
      'X-Knack-Application-ID': '5c73518ae5c38408560026f7',
      'X-Knack-REST-API-Key':'26ab6d50-38ac-11e9-ad75-655785f442f9',
      'content-type':'application/json'
    }, 
    payload: JSON.stringify(payload)
  }
  
  
  var response   = UrlFetchApp.fetch(url, params);   
  
  Logger.log(response);
  
  return response.getContentText();
} 
  
  
  
  
//
//updateRecordsAppenate('5c808f943ff771085e8e3f51');  
function updateRecordsAppenate(id, name){ 

  var staffID = id.toString();
  var staffName = name;
  
  var body = {
    "Id": "5033931b-8b46-49c9-910e-a9ff002eddbc", 
    "NewRows": [[staffID, name, 'Signed Out', '', '', 'Yes']],
    "CompanyId": 55965,
    "IntegrationKey": "cc9efe6abfc04bedb5a631c5bf4e6cf2"
  };
  
  
  var options = {
    'method' : 'put',
    'payload' : JSON.stringify(body),
    'contentType' : 'application/json' 
  };
  
  var url="https://manager.easyforms.co.nz:443/api/v2/datasource"
  var response=UrlFetchApp.fetch(url, options);
  Logger.log(response)  
}

  
 
  
}