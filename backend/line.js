/* LINE送受信 */

var DEBUG = 1;          //1=DEBUG 0=RELEASE   (オーナーにのみ配信する機能もこれ！★)

/* LINEのACCESS_TOKEN等 を heroku configへ各自セット必要
    heroku config:set LINE_CHANNEL_ACCESS_TOKEN=xxxx
    heroku config:set LINE_USERID=xxxx
*/

var request = require('request');
var $ = require('jquery-deferred');
var static_data = require('./line_static_data.js');






var LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
var LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
var LINE_PUSH_URL_MULTICAST = "https://api.line.me/v2/bot/message/multicast";

var TYPE_PUSH = 1;
var TYPE_MULTICAST= 2;

var TYPE_LINE_STAMP_MOTIVATION = 1;
var TYPE_LINE_STAMP_FRIENDS = 2;

var TYPE_LINE_EMOJI_SMILE = 1;



function init_pushmessage(){
  if( pushmessage.length != 0 ){
    while( pushmessage.length > 0 ){
      pushmessage.pop();
    }
  }
}


  
  /* LINEにて送迎者を募集 LINE broadcast */
  module.exports.send_line_broadcast = function(req, res){
    
    var dfd_send_line_broadcast = new $.Deferred;
    
    console.log("start send_line_broadcast");
    console.log("line_broadcast_account = " + line_broadcast_account);
    


    if(DEBUG){
      var to_array = new Array();
      to_array[0] = process.env.LINE_TEST_USERID;
    }
    else{
      var to_array = line_broadcast_account.split(",");
    }
    

      
      
    send_notification( to_array, pushmessage, TYPE_MULTICAST );
  //    send_notification( to_array, pushmessage, TYPE_PUSH );  //送付先が一人の時はTYPE_PUSHでないとダメかも！？（途中で変わった？）
    
    console.log("line before send");

    return dfd_send_line_broadcast.resolve();
  
    
  }
  
  
  module.exports.send_line_reply = function(req, res){
    
    console.log("START send_line_reply");
    console.log("input_message = "+ input_line_message);
    console.log("line_reply_mode = "+ line_reply_mode);
    
    /* DEBUG */
    //line_reply_mode = LINE_MODE_FOLLOW;
    /* DEBUG */
    
    
    var reply_message = set_line_reply_message( line_reply_mode, input_line_message );
    
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
    }
    var body = {
      replyToken: line_reply_token,
  //    messages: pushmessage
      messages: reply_message
    }
  
    request({
      url: LINE_REPLY_URL,
      method: 'POST',
      headers: headers,
      body: body,
      json: true
    });
  }
  

  function set_line_reply_message( mode, input_message ){
  
    init_pushmessage();
    

    if((mode == LINE_MODE_REPLY_COMMENT1 ) || ( mode == LINE_MODE_1 ) || ( mode== LINE_MODE_ACCEPT_REPLY )){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "貴重なご意見ありがとうございました！管理者で確認させて頂きます"
                    + String.fromCodePoint(EMOJI_peace);
      pushmessage[0] = info1;     
      pushmessage[1] = choose_line_stamp( TYPE_LINE_STAMP_MOTIVATION );
       
    }
/*
    else if( mode == LINE_MODE_DENEY_REPLY_NO_DATA ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "その日時に送迎予定の人はいないようです。再確認お願いします"
                    + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));
      pushmessage[0] = info1;
      
      info2 = new PushMessage();
      info2.type = 'sticker';
      info2.packageId = '2';
      info2.stickerId = '38';
      pushmessage[1] = info2;  
    }
    else if( mode == LINE_MODE_DENEY_REPLY_ALREADY_EXIST ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "既に送迎対応者が決まってるようです。次回よろしくお願いします"
                    + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));
      pushmessage[0] = info1;
      
      info2 = new PushMessage();
      info2.type = 'sticker';
      info2.packageId = '2';
      info2.stickerId = '38';
      pushmessage[1] = info2;  
    }
    else if( mode == LINE_MODE_DENEY_REPLY_CANCEL ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "キャンセル了解しました。\n次回よろしくお願いします"
                    + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));
      pushmessage[0] = info1;
      
      info2 = new PushMessage();
      info2.type = 'sticker';
      info2.packageId = '1';
      info2.stickerId = '13';
      pushmessage[1] = info2;  
    } 
    else if( mode == LINE_MODE_SHOW_CALENDER ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = URL_CALENDER;
      pushmessage[0] = info1;
    }
    else if( mode == LINE_MODE_DENEY_REPLY_SHOW_CALENDER ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "その他はカレンダーから登録してください\n"
                    +URL_CALENDER;
      pushmessage[0] = info1;
    }
    else if( mode == LINE_MODE_NOTIFY_CORRECT_FORMAT ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "間違ってますよ"
        + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE))
        + "\n下記フォーマットでお願いします。";
      pushmessage[0] = info1;
      
      info2 = new PushMessage();
      info2.type = 'text';
      info2.text = 
        "日: 2018-〇-〇\n"
        + "時間: 〇:〇\n"
        + "利用者: 〇〇\n"
        + "あなたの名前: 〇〇";
      pushmessage[1] = info2;    
      
      info3 = new PushMessage();
      info3.type = 'text';
      info3.text = 
        "本地区の予約状況は下記で参照可能です\n"
        + URL_CALENDER;
      pushmessage[2] = info3;
      
    }
*/
    if ( mode == LINE_MODE_FOLLOW ){
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "登録ありがとうございました。\n\n"
        + "イベント情報等、ご連絡しますね。ご期待ください"
        //+ "(" + new_follower_line_id.substr( -4 ) +")"
        + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));
      
      pushmessage[0] = info1;

      pushmessage[1] = choose_line_stamp( TYPE_LINE_STAMP_MOTIVATION );

    }
    else if ( mode == LINE_MODE_UNFOLLOW ){   //ブロック後のため本メッセージは届かない見込み
      info1 = new PushMessage();
      info1.type = 'text';
      info1.text = "解除承りました。再登録をお待ちしております" + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));
      pushmessage[0] = info1;
    }
    else{
      //don't care
      console.log("error");
    }

    
    return pushmessage;
  }
  
  
  function make_broadcast_message( num, date, time, pickup_people, destination ){
    var text;
    
    if( num == 1 ){
      text = "下記人からリクエスト有り。\n行ける人いますでしょうか？\n\n"
              + "「リスト」と入力すると送迎未決定リストから選択することが可能です。\nもしくは、下記をコピペしてLINEで返答することもできます。";
    }
    else if( num == 2 ){
      text = "日: " + date + " " + "\n"
              + "時間: " + time + " " + "\n"
              + "利用者: " + pickup_people + "\n"
              + "行先: " + destination;
    }
    else if( num == 3 ){
      text = "よろしくお願いします"
              + String.fromCodePoint(choose_emoji(TYPE_LINE_EMOJI_SMILE));      
    }
    
    return text;
  }
  
  
  function send_notification( destination, push_message, push_or_multicast ){
    
    if(DEBUG){  //DEBUG時はオーナーにしか投げない
      dest = new Array();
      dest[0] = process.env.LINE_TEST_USERID;
      destination = dest;
    }
        
    console.log("send_notification destination="+destination);
    
    var send_url;
    if( push_or_multicast == TYPE_PUSH ){
      send_url = LINE_PUSH_URL;
    }
    else if( push_or_multicast == TYPE_MULTICAST ){
      send_url = LINE_PUSH_URL_MULTICAST;
    }
    else{
      console.log("error");
      return;
    }
  
    
      var headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
      }
      var body = {
          to: destination,
          messages: push_message      
      }
  
        request({
     //     url: LINE_PUSH_URL,
          url: send_url,
          method: 'POST',
          headers: headers,
          body: body,
          json: true
        });
  }

  

function post_back(e) {
    console.log("post_back");
    
    var data = e.postback.data;
    var replay_text = "";
    if (data == "postback selected") {
      replay_text = data;
    } else if (data == "datetimepicker selected") {
      replay_text = data + "\n" + e.postback.params['datetime'];
    }
  
    var postData = {
      "replyToken": e.replyToken,
      "messages": [{
        "type": "text",
        "text": replay_text + "\n" + JSON.stringify(e.postback)
      }]
    };
    fetch_data(postData);
  }
  
  function fetch_data(postData) {
    console.log("fetch_data");
    
        var headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
      }
  
    request({
      url: LINE_REPLY_URL,
  //    url: "https://api.line.me/v2/bot/message/reply",
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData),
  //    json: true
    });
    
    line_reply_mode = -1;
    console.log("fetch_data finish");
    
  }
  /* -------------- */
  
  
  
  function choose_line_stamp( type ){
    var random_num;
    info = new PushMessage();
    info.type = 'sticker';
    
    if( type == TYPE_LINE_STAMP_MOTIVATION ){
      random_num = ( Math.floor( Math.random() * 100 )) % motivation_stamp.length;
      info.packageId = motivation_stamp[random_num][0];
      info.stickerId = motivation_stamp[random_num][1];
    }
    else if( type == TYPE_LINE_STAMP_FRIENDS ){
      random_num = ( Math.floor( Math.random() * 100 )) % friends_stamp.length;
      info.packageId = friends_stamp[random_num][0];
      info.stickerId = friends_stamp[random_num][1];
    }
    else{
      console.log("ERROR: choose_line_stamp");
      info.packageId = '1';
      info.stickerId = '114';
    }
    
    
    console.log("[choose_line_stamp] type="+type + " random_num="+random_num);  
    console.log("[choose_line_stamp] packageId="+info.packageId + " stickerId="+info.stickerId);
    
    return info;
  }
  
  function choose_emoji( type ){
    var emoji_code;
    var random_num;
    
    if( type == TYPE_LINE_EMOJI_SMILE ){
      random_num = ( Math.floor( Math.random() * 100 )) % smile_emoji.length;
      emoji_code = smile_emoji[random_num];
    }
    else{
      console.log("ERROR: choose_emoji");
      emoji_code = EMOJI_SMILE1;
    }
    
    //console.log("emoji_code="+emoji_code);
    return( emoji_code );
    
  }

  

  
  