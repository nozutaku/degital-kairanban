
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');
//var pg = require('pg');
//var querystring = require('querystring');

const fs = require('fs');
const AWS = require('aws-sdk');
const multer = require('multer');

const express = require('express')
const app = express()
const path = require('path');
const port = process.env.PORT || 3001

var line_command = require('./line.js');
var kintone_command = require('./kintone.js');


global.callback_kintone_ids = new Array();    //callback対象kintone_IDテーブル

//ログ記録用　LOG_RECORD=1の時のみ利用
global.input_log;       //ログ記録用バッファ
global.input_log_type;  //ログ記録用種別

//ログ記録用種別内容
//global.LOG_TYPE_REGISTER_LINE_BOT = "送迎登録(LINE返信)";
//global.LOG_TYPE_BROADCAST_LINE_REPLY = "送迎登録(LINE直接送信)";
//global.LOG_TYPE_REGISTER_CALENDER = "送迎登録(カレンダー編集)";

global.LOG_TYPE_LINE_REGISTER_ID = "LINE登録(ID)";
global.LOG_TYPE_LINE_REGISTER_NAME = "LINE登録(名前)";
global.LOG_TYPE_LINE_UNREGISTER = "LINE登録解除";
global.LOG_TYPE_LINE_BROADCAST = "LINE一斉送信";
global.LOG_TYPE_LINE_MESSAGE ="LINEメッセージ";

global.line_reply_mode;
global.input_line_message;
global.line_reply_token;

//line_reply_modeへ格納する値
global.LINE_MODE_1 = 1;

global.LINE_MODE_ACCEPT_REPLY = 2;
global.LINE_MODE_REPLY_COMMENT1 = 3;
global.LINE_MODE_DENEY_REPLY_NO_DATA = 4;
global.LINE_MODE_DENEY_REPLY_ALREADY_EXIST = 5;
global.LINE_MODE_DENEY_REPLY_CANCEL = 6;
global.LINE_MODE_DENEY_REPLY_SHOW_CALENDER = 7;
global.LINE_MODE_SHOW_CALENDER = 90;


global.LINE_MODE_NOTIFY_CORRECT_FORMAT = 7;   //フォーマット問い合わせ
global.LINE_MODE_FOLLOW = 8;
global.LINE_MODE_FOLLOW_REGISTER_NAME = 9;
global.LINE_MODE_UNFOLLOW = 10;

global.new_follower_line_id;
global.new_follower_name;






global.PushMessage = function( ){
  this.type;
  this.text = "";
  this.originalContentUrl = "";     //画像URL(https) MAX 10MB https://developers.line.biz/ja/reference/messaging-api/#image-message
  this.previewImageUrl = "";        //画像URL(https) MAX 1MB
  this.packageId;
  this.stickerId;
}
global.pushmessage = new Array();


function init_pushmessage(){
  if( pushmessage.length != 0 ){
    while( pushmessage.length > 0 ){
      pushmessage.pop();
    }
  }
}


//tempここから
// グローバル変数。追加時はinit_input_data()に追加すること
global.input_date;
global.input_time;
//global.input_pickup_people;   //送迎対象者(送迎される人)
//global.input_pickup_people_num;   //送迎対象者(送迎される人)の番号
//global.input_pickup_people_callid;  //送迎対象者の電話番号
//global.input_pickup_people_auto_call_flg;   //送迎対象者への自動電話連絡有無
global.input_sender;          //送迎する人
global.input_sender_line_id;  //送迎する人のLINEID
//global.input_destination;
//global.input_destination_num; //場所の番号
global.input_kintone_id;
global.line_broadcast_account　= "";

global.input_is_attached = "無し";

global.TAG_REGISTER_NAME1 = "名前は";
global.TAG_REGISTER_NAME2 = "です";


global.line_broadcast_account;
global.email_broadcast_account;


app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



/////////////////////////////////////////////////////////////
//              debug
/////////////////////////////////////////////////////////////

app.post("/api/commandtest/:command", function(req, res, next){
    console.log("req.params.command="+req.params.command);
    res.status(200).end();

    if( req.params.command == "1"){

      console.log("------");
      console.log("TEST 1 ");

      init_pushmessage();

      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "1_これはテストです";
      pushmessage[0] = info1;

      /*
      info2 = new PushMessage();
      info2.type = 'text';
      info2.text = "2_10/16折り紙イベントに来ませんか？";
      pushmessage[1] = info2;
      */

      info2 = new PushMessage();
      info2.type = 'image';   //https://developers.line.biz/ja/reference/messaging-api/#image-message
      info2.originalContentUrl = "https://degital-kairanban.s3.us-west-2.amazonaws.com/image.jpg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLW5vcnRoZWFzdC0xIkYwRAIgckmQhlm7OprVrsyVCTyEuAQca0rv5N%2Fdc3niNNff8MQCIB%2F6iK37oG3gCkrxtdjBnIiAnftx0lpoovnX%2BJeCAOMYKqcCCBgQAxoMNDQwMDk5NDM2Mzk1Igw8zE3LJNL0C0eZFo4qhAINqJJHfhRtNg4gk%2Be4dMyPHCepmbdOHtKQEiNhsuTgC2j%2FwaeavNMAspPLi5GMpIKWdPQvBulLlTDaGxSChrFNnqMGsITsV7lvPi4laYylt9wzGsHRUZKK%2Fq74nUUNAl56On4Q1theFIcX2OsR1ajgXYcoIE%2BuxqqQ3tgM73aT4oXt8nKfyxcG5dx5vGtyZGe6BhtSt%2F3bXV9rNFtk7SiMYyT3RKFafsFeN%2F9uIwu6QGXtUdT3Y9qX7HlvkXXhdpfPS7vpi3vPx%2BaurMuURPNdA%2B%2BlHki735XZ5WvrA1CIXzr80jg2EEGDozKO%2BlNmrztFwhiY1lxsqwc3PC40%2BkRyXQBtIzC44vCOBjrgAf6gpBmCS3j6SD2StPV8cEtGg1HtqQjzZswy0CLqvnDwlGnddc91It%2FZrQbskaZJh9iZUBv8konJmJ16Er1WxYrGIRTU2BsOS0%2F9hWvb0Qs5xFzCCWLPrO083feJRXc9PGYPl2ABw7uJEXnY8IP7v5bxnW1h8I1X%2F1uU6dzL%2FKZ%2FtlzbiUHBMd7UfdFjdLR%2Fzt4oAJb7QFlZ%2Bjh3rs3gOab%2BWhI8maDs8L02qN6kYZCVVKptclc5gJn7GCBhhx5l%2F3s%2FonaN6i1d5ZOnDEnIl2ioXpaCTEmfa7o2gYzkxXR5&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220110T224356Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=ASIAWM57YO5VYPR3UBDY%2F20220110%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=11d635bcfd0d66022310ab2f80cfe815abc25dd465aa46d52761773b9a9dc338";
      //info2.originalContentUrl = "https://dev-degital-kairanban.herokuapp.com/tmp/image.jpg";
      //info2.originalContentUrl = "/tmp/image.jpg";
      
      //info2.originalContentUrl = "https://corporate.jp.sharp/shared/img/logo_sharp_200sq.png";
      //info2.previewImageUrl = "https://dev-degital-kairanban.herokuapp.com/tmp/image.jpg";
      info2.previewImageUrl = "https://degital-kairanban.s3.us-west-2.amazonaws.com/image.jpg?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLW5vcnRoZWFzdC0xIkYwRAIgckmQhlm7OprVrsyVCTyEuAQca0rv5N%2Fdc3niNNff8MQCIB%2F6iK37oG3gCkrxtdjBnIiAnftx0lpoovnX%2BJeCAOMYKqcCCBgQAxoMNDQwMDk5NDM2Mzk1Igw8zE3LJNL0C0eZFo4qhAINqJJHfhRtNg4gk%2Be4dMyPHCepmbdOHtKQEiNhsuTgC2j%2FwaeavNMAspPLi5GMpIKWdPQvBulLlTDaGxSChrFNnqMGsITsV7lvPi4laYylt9wzGsHRUZKK%2Fq74nUUNAl56On4Q1theFIcX2OsR1ajgXYcoIE%2BuxqqQ3tgM73aT4oXt8nKfyxcG5dx5vGtyZGe6BhtSt%2F3bXV9rNFtk7SiMYyT3RKFafsFeN%2F9uIwu6QGXtUdT3Y9qX7HlvkXXhdpfPS7vpi3vPx%2BaurMuURPNdA%2B%2BlHki735XZ5WvrA1CIXzr80jg2EEGDozKO%2BlNmrztFwhiY1lxsqwc3PC40%2BkRyXQBtIzC44vCOBjrgAf6gpBmCS3j6SD2StPV8cEtGg1HtqQjzZswy0CLqvnDwlGnddc91It%2FZrQbskaZJh9iZUBv8konJmJ16Er1WxYrGIRTU2BsOS0%2F9hWvb0Qs5xFzCCWLPrO083feJRXc9PGYPl2ABw7uJEXnY8IP7v5bxnW1h8I1X%2F1uU6dzL%2FKZ%2FtlzbiUHBMd7UfdFjdLR%2Fzt4oAJb7QFlZ%2Bjh3rs3gOab%2BWhI8maDs8L02qN6kYZCVVKptclc5gJn7GCBhhx5l%2F3s%2FonaN6i1d5ZOnDEnIl2ioXpaCTEmfa7o2gYzkxXR5&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220110T224356Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=ASIAWM57YO5VYPR3UBDY%2F20220110%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=11d635bcfd0d66022310ab2f80cfe815abc25dd465aa46d52761773b9a9dc338";
      
      //info2.previewImageUrl = "https://corporate.jp.sharp/shared/img/logo_sharp_200sq.png";
      pushmessage[1] = info2;



      console.log("line_command START");
      line_command.send_line_broadcast();
      console.log("line_command END");

      console.log("------");

    }

    if( req.params.command == "2"){


    }


});

/////////////////////////////////////////////////////////////
//              POST
/////////////////////////////////////////////////////////////
app.post('/line_webhook', function(req, res, next){
	console.log("come to line_webhook.");

  //console.log("req="+ req);
  console.log("req.body.destination="+req.body.destination);
  console.log("req.body.events[0].type=" + req.body.events[0].type);

  console.log("req.body=");
  console.log(req.body);

  res.status(200).end();
  //res.send("your command receive");
  




  for (var event of req.body.events){     //★★★ここから
    if (event.type == 'message'){
      
      line_reply_mode = LINE_MODE_1;
      line_message(event);
    }


    // アカウントが友だち追加またはブロック解除された
    else if(( event.type == 'follow' ) || ( event.type == 'unfollow' )){
      console.log("====================\n");
      console.log("follow/unfollow event.ともだち追加/削除してくれたよ")
      console.log(event);
      console.log("====================\n");
        
      if( event.source.type == "user" ){
        if (typeof event.source.userId === 'undefined') {
          console.log("follow event but not user???");
        }else{
          new_follower_line_id = event.source.userId;
          console.log("new_member="+new_follower_line_id);
            
            
          //LINE IDをDBに追加・削除
          if( event.type == 'follow' ){
            
            kintone_command.set_account_data2db();
            //insert_line_id2db( new_follower_id, TYPE_USER );
          }
          else if ( event.type == 'unfollow' ){   //解除後なので、おそらくここには飛んでこない
            console.log("LINE account unfollow");
            kintone_command.delete_account_data2db();   //★★うまく動かない！！！！！！誰かヘルプ！！！→kintoneのpermissionで削除を有効にすれば削除されるだろう
            
          }
          else{
            //don't care.
          }
            
          //welcome メッセージを送る
          if( event.type == 'follow' ){
            
            line_reply_mode = LINE_MODE_FOLLOW_REGISTER_NAME;
            input_log_type = LOG_TYPE_LINE_REGISTER_ID;
            //line_message(event);
          }
          else{
            line_reply_mode = LINE_MODE_UNFOLLOW;
            input_log_type = LOG_TYPE_LINE_UNREGISTER;
            //line_message(event);
            
          }
          input_line_message = "";
          line_reply_token = event.replyToken;
          line_command.send_line_reply();
          
          //log record
          input_is_attached = "無し";
          input_log = "line_id=" + new_follower_line_id;
          kintone_command.set_log_db();
          
        }
      }
    }
    // グループまたはトークルームに参加
    else if(( event.type == 'join' ) || ( event.type == 'leave' )){
    }
    //button選択した場合
    else if( event.type == 'postback' ){
      console.log("event.source.userId="+event.source.userId);
      console.log("event.postback.data="+event.postback.data);
      
      line_reply_token = event.replyToken;

      
      var postback_type = check_postback_type( event.postback.data );
      
      if( postback_type == POSTBACK_TYPE_NEED_CONFIRM ){
        
        kintone_command.check_still_vacant()
        .done(function(){
          if( input_kintone_id > 0 ){
            //input_kintone_idは既に入力済
            line_command.send_line_confirm();
          }
          else{
            line_reply_mode = LINE_MODE_DENEY_REPLY_ALREADY_EXIST;
            input_line_message = "";
            line_command.send_line_reply();
            console.log("sender is already decided.");
          }
        });
        
      }else if( postback_type == POSTBACK_TYPE_REGISTER ){
        input_kintone_id = event.postback.data;
        
        
        kintone_command.check_still_vacant()
        .done(function(){
          if( input_kintone_id > 0 ){
            
            input_sender_line_id = event.source.userId;
            
            kintone_command.get_input_sender_name()
            .then(kintone_command.update_id2db)
            .done(function(){
              input_line_message = "";
              line_reply_mode = LINE_MODE_ACCEPT_REPLY;
              line_command.send_line_reply();
              console.log("kintone_command send");
              
              if(( line_reply_mode == LINE_MODE_ACCEPT_REPLY ) && ( input_kintone_id > 0 )){
                
                //call_to_pickup_people にて電話発信しなかった場合の登録内容
                //input_log_type = LOG_TYPE_REGISTER_LINE_BOT;
                //input_log = "LINE返答登録"; //call_to_pickup_peopleの中でもLog登録行っているためコメント追加

                //call_to_pickup_people( input_kintone_id );  //送迎対象者に送迎予定を電話で伝える　＆ Log record
              }
              else{
                //log record
                //input_pickup_people_num = ""; //pickup_people_numだけ取得していないので初期化しておく
                // input_date、input_time、input_sender、 input_pickup_people、input_destinationそのまま残す(エラーになってる場合もあると思うけどログ記録なので良いでしょう)
                input_log = "kintone_id=" + input_kintone_id + "  sender_line_id="+input_sender_line_id;
                input_log_type = LOG_TYPE_REGISTER_LINE_BOT;
                //kintone_command.set_log_db();    ★2021/10/12 comment out
                // input_xxの初期化が行われないので次機会に正常動作するか心配
              }

            });


          }
          else{ //既に送迎者が決まっていた場合kintone_command.check_still_vacant()の中でinput_kintone_id = -1が設定される

              line_reply_mode = LINE_MODE_DENEY_REPLY_ALREADY_EXIST;
              input_line_message = "";
              line_command.send_line_reply();
              console.log("sender is already decided.");

          }

          });
        
      }
      /*
      else if( postback_type == POSTBACK_TYPE_CANCEL ){
        input_kintone_id = -1;
        line_reply_mode = LINE_MODE_DENEY_REPLY_CANCEL;
        input_line_message = "";
        line_command.send_line_reply();
        console.log("cancel");
        
      }
      else if( postback_type == POSTBACK_TYPE_MANY_VACANT ){
        input_kintone_id = -1;
        line_reply_mode = LINE_MODE_DENEY_REPLY_SHOW_CALENDER;
        input_line_message = "";
        line_command.send_line_reply();
        console.log("many vacant");
      }
      */
              
      else{
        //無いはず
        console.log("error postback type");
      }

    }
    //よくわからないメッセージ受信
    else{
      console.log("unknown webhook");    //★★LINEスタンプを返そう。「ごめんわからないよー」とかの意味の
      console.log(event);
    
    }
  }
  
});


function line_message( event ){
  
  line_reply_token = event.replyToken;
  
  console.log("====================\n");
  console.log("LINE message event come now.")
  //console.log(event);
  console.log("====================\n");
          
  if( event.source.type != "user" ){
    console.log("NOT from user. so no reply");
    return;
  }
  

  if( event.type == 'message' ){
    input_line_message = event.message.text;
    input_sender_line_id = event.source.userId;
    console.log("input_message = "+ input_line_message);
    //input_destination = " ";
      
    if( check_register_message( input_line_message )){
      new_follower_line_id = input_sender_line_id;

      kintone_command.update_account_data2db()
      //.then(line_command.send_request_register_place)
      .done(function(){
        line_reply_mode = LINE_MODE_FOLLOW;
        line_command.send_line_reply();

        input_is_attached = "無し";
        input_log = "line_id=" + new_follower_line_id + "name=" + new_follower_name;
        kintone_command.set_log_db();
      });

      return;
    }

    input_log = "id=" + input_sender_line_id + " msg=" + input_line_message;
    input_log_type = LOG_TYPE_LINE_MESSAGE;

    kintone_command.set_log_db()
    .done(function(){
      line_reply_mode = LINE_MODE_REPLY_COMMENT1;
      line_command.send_line_reply();
    });

  }
  /*
  else{
    console.log("error. line_message");
    input_line_message = "";
    line_reply_mode = LINE_MODE_NOTIFY_CORRECT_FORMAT;
    
    line_command.send_line_reply();
  }
  */


  
}


var storage = multer.diskStorage({
  //ファイルの保存先を指定(ここでは保存先は./public/images) 
  //Express4の仕様かなんかで画像staticなファイルを保存するときはpublic/以下のフォルダに置かないとダメらしい
  //詳しくは express.static public でググろう！
  destination: function(req, file, cb){
    //cb(null, './public/images/')
    cb(null, '/tmp')
    //console.log("finish to store file.");
  },
  //ファイル名を指定
  //ここでは image.jpg という名前で保存
  filename: function(req, file, cb){
    cb(null, 'image.jpg')
    //console.log("finish to change file name.");
  }

})

console.log("finalize file.");

var upload = multer({storage: storage})


app.post('/api/upload/file', upload.single('file'), function(req, res, next){

  console.log("come to /api/upload/file.");
  //console.log("req=");
  //console.log(req);

  //console.log("req.body=");
  //console.log(req.body);
  console.log("req.body.text = " + req.body.text);
  console.log("req.body.pass = " + req.body.pass);
  
  
  if( req.body.pass != process.env.MANAGER_PASS ){
    console.log("manager password is wrong");
    res.json({ 'result': 'Password is wrong!' });
    return;
  }
  

  AWS.config.update({
    "accessKeyId": process.env.AWS_ACCESSKEY,
    "secretAccessKey":process.env.AWS_SECRETACCESSKEY,
    "region": process.env.AWS_REGION 
  });

  var s3 = new AWS.S3();
  var params1 = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: process.env.AWS_KEY
  };

  var params2 = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: process.env.AWS_KEY,
    Expires: 60
  };
 
  /* ファイルUL */
  var v= fs.readFileSync("/tmp/image.jpg");
  console.log("readFileSync");
  params1.Body=v;
  s3.putObject(params1, function(err, data) {
    if (err) console.log(err, err.stack);
    else{
      //console.log(data);
      // URL取得
      s3.getSignedUrl('getObject', params2, function (err, url) {
        console.log("The URL is", url);


        /* ============================= */
        init_pushmessage();
        info1 = new PushMessage();
        info1.type = 'text';
        //info1.text = "1_これはテストです";
        info1.text = req.body.text;
        pushmessage[0] = info1;

        info2 = new PushMessage();
        info2.type = 'image';   //https://developers.line.biz/ja/reference/messaging-api/#image-message
        info2.originalContentUrl = url;

        info2.previewImageUrl = url;
        pushmessage[1] = info2;

        console.log("line_command START");
        line_command.send_line_broadcast();
        console.log("line_command END");

        console.log("------");



      });
    }
  });
  res.json({ 'result': 'success!' });

});

/*
router.post('/', upload.single('file'), function(req, res) {
  res.json({ 'result': 'success!' });
});
*/

/*
app.post('/api/upload/file', multer({ dest: 'tmp/' }).single('file'), (req, res) => {
  console.log("come to upload file.");
  const filename = req.body.filename
  const content = fs.readFileSync(req.file.path, 'utf-8');
  res.send(filename + ': ' + content);

});
*/



app.post('/api/upload/text', function(req, res, next){
	console.log("come to /api/upload/text.");

  //console.log("req="+ req);
  //console.log("JSON.stringify(req)=\n" );
  //console.log(JSON.stringify(req));
  //console.log("req.body=\n" );
  //console.log("req.body.text = " + req.body.text);
  //console.log("req.body.pass = " + req.body.pass);
  console.log("==============================================");

  console.log("req.body.props.text=" + req.body.props.text);
  console.log("req.body.props.pass=" + req.body.props.pass);
  
  console.log("==============================================");

  if( req.body.props.pass != process.env.MANAGER_PASS ){
    console.log("manager password is wrong");
    res.json({ 'result': 'Password is wrong!' });
    return;
  }

  init_pushmessage();

  info1 = new PushMessage();
  info1.type = 'text';
  info1.text = req.body.props.text;
  //info1.text = req.body.text;
  pushmessage[0] = info1;


  kintone_command.get_account_all()
  .then(line_command.send_line_broadcast)
  .done(function(){
    /*
    console.log("line_command START");
    line_command.send_line_broadcast();
    console.log("line_command END");
  */
    //LOG
    input_log_type = LOG_TYPE_LINE_BROADCAST;  
    input_is_attached = "無し";
    input_log = "";  //★★ここに本文の先頭数文字を。
    kintone_command.set_log_db();

    console.log("------");
  });

  res.status(200).end();



});



app.post('/', function (req, res) {
  console.log("etc");
  res.send('POST request work well');
});

/////////////////////////////////////////////////////////////
//              GET 表示系
/////////////////////////////////////////////////////////////

app.get("/api", (req, res) => {
    res.json({ message: "Hello World3" });
});
  
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'../frontend/build/index.html'));
});


/////////////////////////////////////////////////////////////
//              UTILITY
/////////////////////////////////////////////////////////////

// 「名前は●●です」フォーマットならば名前登録とみなし、
//new_follower_name に名前を格納し
//"1"をreturn
function check_register_message( str ){
  var ret = 0;

  if( str.indexOf( TAG_REGISTER_NAME1 ) != -1 ){
    new_follower_name = str.substr( TAG_REGISTER_NAME1.length, str.length-TAG_REGISTER_NAME1.length );
    ret = 1;

    if( new_follower_name.indexOf( TAG_REGISTER_NAME2 ) != -1 ){
      new_follower_name = new_follower_name.substr( 0, new_follower_name.length-TAG_REGISTER_NAME2.length );
    }
  }

  return ret;

}

app.listen(port, () => {
    console.log(`listening on *:${port}`);
})

