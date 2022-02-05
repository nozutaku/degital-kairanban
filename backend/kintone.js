/******************************************
 kintone DB
 
   heroku configへ下記各自セット必要
    heroku config:set KINTONE_BASE_URL=xxxx
    heroku config:set KINTONE_BASE_URL_MULTI=xxxx
    heroku config:set KINTONE_DESTINATION_TOKEN=xxxx
    heroku config:set KINTONE_DESTINATION_APP_ID=xxxx

    heroku config:set KINTONE_LOG_DB_API_TOKEN
    heroku config: set KINTONE_LOG_DB_APP_ID
    
******************************************/

var DEBUG = 1;          //1=DEBUG 0=RELEASE   (特定時間以外broadcastしない機能もここ)
var LOCAL_DEBUG = 0;    //1=Local node.js利用   0=herokuサーバー利用(default)  


var request = require('request');
var $ = require('jquery-deferred');

/*
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var pg = require('pg');
*/

var kintone_id;






/* ====== 登録者DB操作 ======= */

module.exports.set_account_data2db = function(req, res){
  set_account( new_follower_line_id );
}

module.exports.update_account_data2db = function(req, res){
  var dfd_update_account = new $.Deferred;
  return update_account_name( dfd_update_account, new_follower_line_id, new_follower_name );
}

module.exports.delete_account_data2db = function(req, res){
  delete_account( new_follower_line_id );
}

module.exports.get_account_all = function(req, res){
  var dfd_get_account_all = new $.Deferred;
  
  return get_account_data_all( dfd_get_account_all );
  
}

module.exports.get_input_sender_name = function(req, res){
  var dfd_get_input_sender_name = new $.Deferred;
  return get_input_sender_name_inner( dfd_get_input_sender_name );
}


/* ====== ログDB操作 ======= */
module.exports.set_log_db = function(req, res){
  var dfd_set_log_db = new $.Deferred;
  
  return log_record( dfd_set_log_db, input_is_attached, input_log );
}




/* ------------------------------------------------------------
   kintoneへデータをセットする（アカウントDB）
  ------------------------------------------------------------- */
function set_account( id ){
  
  console.log("URL="+process.env.KINTONE_BASE_URL);
  console.log("API TOKEN="+process.env.NO1_KINTONE_DESTINATION_TOKEN);
  console.log("APP ID="+process.env.NO1_KINTONE_DESTINATION_APP_ID);
  console.log("id="+id);
  
  
  var options = {
    uri: process.env.KINTONE_BASE_URL,
    headers: {
      "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN,
      "Content-type": "application/json"
    },
    json: {
      "app": process.env.NO1_KINTONE_DESTINATION_APP_ID,
      "record": {
        "line_id": {
          "value": id
        }
      }
    }
  };

  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[set_data]success!");
    } else {
      console.log('[set_data]http error: '+ response.statusCode);
    }
  });

}



/* ------------------------------------------------------------
   idのデータレコードにnameを追加する（アカウントDB）
  ------------------------------------------------------------- */
function update_account_name( dfd, id, name ){
  
  console.log("URL="+process.env.KINTONE_BASE_URL);
  console.log("API TOKEN="+process.env.NO1_KINTONE_DESTINATION_TOKEN);
  console.log("APP ID="+process.env.NO1_KINTONE_DESTINATION_APP_ID);
  console.log("id="+id);
    
    
  select_account_id()
  .done(function(){
    return update_account_name_inner( dfd, kintone_id, new_follower_name );
    //return dfd.resolve();
  });  
    
  return dfd.promise();

    /*
    var options = {
      uri: process.env.KINTONE_BASE_URL,
      headers: {
        "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN,
        "Content-type": "application/json"
      },
      json: {
        "app": process.env.NO1_KINTONE_DESTINATION_APP_ID,
        "record": {
          "line_id": {
            "value": id
          }
        }
      }
    };
  
    request.post(options, function(error, response, body){
      if (!error && response.statusCode == 200) {
        console.log("[set_data]success!");
      } else {
        console.log('[set_data]http error: '+ response.statusCode);
      }
    });
    */
}

  
  


/* ------------------------------------------------------------
   kintoneへデータを削除する（アカウントDB）
  ------------------------------------------------------------- */
function delete_account( id ){    //new_follower_line_id
  select_account_id()
  .done(function(){
    delete_account_inner( kintone_id );
  });  
  
}








/* ------------------------------------------------------------
   kintoneの特定のIDのデータを抽出する
  ------------------------------------------------------------- */
  function select_account_id(){   //
  
  var dfd_select_account_id = new $.Deferred;
  
  var select_url = process.env.KINTONE_BASE_URL_MULTI;
  
  var raw_query = "line_id=" + "\"" + new_follower_line_id + "\"" ;
  
  console.log("raw_query = " + raw_query );
  
  select_url = select_url + "?app=" + process.env.NO1_KINTONE_DESTINATION_APP_ID + "&query=" + encodeURIComponent( raw_query );

  
  console.log("select_url = " + select_url);
  
  var options = {
    uri: select_url,
    headers: {
      "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN
    },
    json: true
  };

  request.get(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[select_id]success!");
      
      //console.log("body");
      //console.log(body);
      
      //ID抽出
      var num = Object.keys(body.records).length;
      console.log("num = " + num);
      
      for (var i = 0; i < num; i++){
          
        kintone_id = body.records[i].$id.value;
        console.log("kintone_id = " + kintone_id );
          
        return dfd_select_account_id.resolve();
      }
        
      kintone_id = -1;    //error
    
      return dfd_select_account_id.resolve();
    } else {
      console.log('[select_id]http error: '+ response.statusCode);
      return dfd_select_account_id.resolve();
    }
  });  
  
  return dfd_select_account_id.promise();
    
    
}



/* request.delete が存在しない？？？ */

/* ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  http deleteがうまくいかなーーーーーい！！
  ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ */

function delete_account_inner( kintone_id ){
  console.log("id="+kintone_id);
  
  var dfd_delete_id = new $.Deferred;
  
  var options = {
    uri: process.env.KINTONE_BASE_URL_MULTI,
    method : 'DELETE',
    headers: {
      "method": 'DELETE',
      "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN,
      "Content-type": "application/json"
    },
    json: {
      "app": process.env.NO1_KINTONE_DESTINATION_APP_ID,
      "ids": [1]
      //"ids": kintone_id
    }
  };

  request.put(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[delete_data]success!");
      return dfd_delete_id.resolve();
    } else {
      console.log('[delete_data]http error: '+ response.statusCode);
      return dfd_delete_id.resolve();
    }
  });
  
  return dfd_delete_id.promise();  
  
}

/* ------------------------------------------------------------
   kintoneの特定のIDのデータをupdateする
  ------------------------------------------------------------- */
  function update_account_name_inner( dfd_updateid, kintone_id, name ){
  
    console.log("id="+kintone_id+"  name="+name);
    
    //var dfd_updateid = new $.Deferred;
    
    if( kintone_id == -1 ){
      console.log("update_account error");
      //line_reply_mode = LINE_MODE_DENEY_REPLY_NO_DATA;
        return dfd_updateid.resolve();
    }
    
    var options = {
      uri: process.env.KINTONE_BASE_URL,
      headers: {
        "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN,
        "Content-type": "application/json"
      },
      json: {
        "app": process.env.NO1_KINTONE_DESTINATION_APP_ID,
        "id": kintone_id,
        "record": {
          "name": {
            "value": name
          }
        }
      }
    };
  
    request.put(options, function(error, response, body){
      if (!error && response.statusCode == 200) {
        console.log("[update_data]success!");
        return dfd_updateid.resolve();
      } else {
        console.log('[update_data]http error: '+ response.statusCode);
        //line_reply_mode = LINE_MODE_DENEY_REPLY_NO_DATA;
        return dfd_updateid.resolve();
      }
    });
    
    return dfd_updateid.promise();
    
  }

  



function get_account_data_all( dfd ){
  
  var select_url = process.env.KINTONE_BASE_URL_MULTI;
  
  //var raw_query = "line_id=" + "\"" + new_follower_line_id + "\"" ;
  //console.log("raw_query = " + raw_query );
  
  select_url = select_url + "?app=" + process.env.NO1_KINTONE_DESTINATION_APP_ID;
  //select_url = select_url + "?app=" + process.env.CYBOZU_ACCOUNT_APP_ID + "&query=" + encodeURIComponent( raw_query );

  
  console.log("select_url = " + select_url);
  
  
  var options = {
    uri: select_url,
    headers: {
      "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN
    },
    json: true
  };

  request.get(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[select_id]success!");
      
      //console.log("body");
      //console.log(body);
      
      //ID抽出
      var num = Object.keys(body.records).length;
      console.log("num = " + num);
      
      var line_one_id, email_one_id;
      line_broadcast_account = "";
      email_broadcast_account = "";
      
      for (var i = 0; i < num; i++){
          
        line_one_id = body.records[i].line_id.value;
        console.log("line_one_id = " + line_one_id );
        //email_one_id = body.records[i].mail_address.value;
        console.log("email_one_id = " + email_one_id );
        
        if( line_one_id != ""){
          if( line_broadcast_account != "" ){
            line_broadcast_account += "," + line_one_id;
          }
          else{
            line_broadcast_account = line_one_id;
          }
        }
                
        if( email_one_id != ""){
          if( email_broadcast_account != "" ){
            email_broadcast_account += "," + email_one_id;
          }
          else{
            email_broadcast_account = email_one_id;
          }
        }
          
      }
      
      console.log("line_broadcast_account="+line_broadcast_account);
      console.log("email_broadcast_account="+email_broadcast_account);

    
      return dfd.resolve();
    } else {
      console.log('[select_id]http error: '+ response.statusCode);
      return dfd.resolve();
    }
  });  
  
  return dfd.promise();  
}






/* ------------------------------------------------------------
   送迎者LINE番号(input_sender_line_id)から送迎者名(input_sender)を取得する
  ------------------------------------------------------------- */
function get_input_sender_name_inner( dfd ){
  
  var select_url = process.env.KINTONE_BASE_URL_MULTI;
  
  var raw_query = "line_id=" + "\"" + input_sender_line_id + "\"";
  console.log("raw_query = " + raw_query );
  
  select_url = select_url + "?app=" + process.env.NO1_KINTONE_DESTINATION_APP_ID + "&query=" + encodeURIComponent( raw_query );
  console.log("select_url = " + select_url);
  
  var options = {
    uri: select_url,
    headers: {
      "X-Cybozu-API-Token": process.env.NO1_KINTONE_DESTINATION_TOKEN
    },
    json: true
  };

  request.get(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[get_input_sender_name_inner]success!");
      
      //console.log("body");
      //console.log(body);
      
      //ID抽出
      var num = Object.keys(body.records).length;
      console.log("num = " + num);
      
      if( num == 1 ){
        input_sender = body.records[0].name.value;
        console.log("[get_input_sender_name_inner] input_sender = "+input_sender + "input_sender_line_id="+input_sender_line_id);
      }
      else{
        input_sender = input_sender_line_id;    //エラーは番号を入れる仕様
        console.log("[get_input_sender_name_inner] ERROR!!!! num="+num);
      }
      
      return dfd.resolve();
      
    } else {
      input_sender = input_sender_line_id;    //エラーは番号を入れる仕様
      console.log('[get_input_sender_name_inner]http error: '+ response.statusCode);
      return dfd.resolve();
    }
  });  
  
  return dfd.promise();  
  
}




/* ------------------------------------------------------------
   ログをkintoneへ記録
  ------------------------------------------------------------- */
function log_record( dfd, is_attached, input_log ){

  
  var options = {
    uri: process.env.KINTONE_BASE_URL,
    headers: {
      "X-Cybozu-API-Token": process.env.KINTONE_LOG_DB_API_TOKEN,
      "Content-type": "application/json"
    },
    json: {
      "app": process.env.KINTONE_LOG_DB_APP_ID,
      "record": {
        "type": {
          "value": input_log_type
        },
        "is_attached":{
          "is_attached": is_attached
        },
        "comment":{
          "value": input_log
        }
      }
    }
  };

  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("[log_record]success!");
      return dfd.resolve();
    } else {
      console.log('[log_record]http error: '+ response.statusCode);
      console.log(body);
      return dfd.resolve();
    }
  });
  
  return dfd.promise();
  
}


