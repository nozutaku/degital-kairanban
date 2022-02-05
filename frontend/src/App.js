import React, { Component } from 'react'
import axios from 'axios';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';


/* ===========================================
  トップページ
  ============================================ */
class Root extends Component {
  constructor(props){
    super(props)
  }
  render() {
    return <h1>正しいURLを入力ください</h1>;
  }
}

/* ===========================================
  自治連合会　ページ
  ============================================ */
class PageRengo extends Component{
  constructor(props){
    super(props)
  }

  render() {
    return <div>
      <h1 class="bg-secondary text-white display-4">デジタル回覧板　鹿ノ台自治連合会</h1>
      <UtilitySendMessagePage board="1" />
    </div>
  }
}

/* ===========================================
  北サロン　ページ
  ============================================ */
class PageNorthSalon extends Component{

  constructor(props){
    super(props)
  }

  render() {
    return <div>
      <h1 class="bg-primary text-white display-4">デジタル回覧板　北サロン</h1>
      <UtilitySendMessagePage board="2" />
    </div>
      
  }
}

/* ===========================================
  タイトル以外の実体
  ============================================ */
class UtilitySendMessagePage extends Component {

  /*
  inputText = ''
  inputFile = ''
  inputPass = ''
  */
  inputFile = '';

  constructor(props){
    super(props)
    this.state = {
      board: props.board,
      send: '',
      message:'',
      file:'',
      pass:''
    }
    this.doTextChange = this.doTextChange.bind(this)
    this.doFileChange = this.doFileChange.bind(this)
    this.doPassChange = this.doPassChange.bind(this)
    this.doSubmit = this.doSubmit.bind(this)
    this.doDeleteFile = this.doDeleteFile.bind(this)
    //this.doCertification = this.doCertification(this)

    console.log("[UtilitySendMessagePage init]board = " + this.state.board);
    console.log("[UtilitySendMessagePage init]send = " + this.state.send);
    console.log("[UtilitySendMessagePage init]message = " + this.state.message);
    console.log("[UtilitySendMessagePage init]file = " + this.state.file);
    console.log("[UtilitySendMessagePage init]pass = " + this.state.pass);

  }

  doTextChange(event){
    this.setState({
      message: event.target.value
    })

    //this.inputText = event.target.value;

    //event.preventDefault()
  }

  doFileChange(event){

    this.setState({
      file: event.target.files[0]
    })
    this.inputFile = event.target.files[0];     //★temporary
    console.log("inputFile="+this.inputFile);
    
  }

  doPassChange(event){

    this.setState({
      pass: event.target.value
    })
    //this.inputPass = event.target.value;
  }

  doSubmit(event){
    
    //console.log("input="+this.input);
    /*
    this.setState({
      send: '送信しました！',
      message: this.inputText,
      file: this.inputFile,
      pass: this.Pass
    })
    */
    this.setState({
      send: '送信しました！'
    })

    var senddata = {
      board: this.state.board,
      text: this.state.message,
      file: this.state.file,
      pass: this.state.pass
      //text: "abc"
      //text: this.inputText,
      //message: this.inputText,
      //image : " ",
      //file: this.inputFile,
      //pass : this.inputPass
    }
    send_InputData2backend(senddata);

    event.preventDefault()
  }

  doDeleteFile(event){

  }

  /*
  doCertification(event){

  }
  */
  


  render(){
    return <div class="container">

      <div class="form-group">
        <label for="inputText">送信文面</label>
        <textarea class="form-control" rows="8" maxLength="5000" onChange={this.doTextChange} />
      </div>


      <div class="form-group">
        <label for="inputFile">添付ファイル（オプション）</label>
        <div class="input-group">
          <div class="custom-file">
            <input type="file" class="custom-file-input" onChange={this.doFileChange}/>
            <label class="custom-file-label" for="inputFile" data-browse="参照">ファイルを選択(ここにドロップすることもできます)</label>
          </div>
          <div class="input-group-append">
            <button type="button" class="btn btn-outline-secondary input-group-text" onDeleteFile={this.doDeleteFile}>取消</button>
          </div>
        </div>
      </div>

      <br/><br/>
      <hr/>
      <div class="form-group">
        <label for="inputPass">管理者パスワード（これは送信されません）</label>
        <input type="password" class="form-control" onChange={this.doPassChange} />
      </div>


      <form onSubmit={this.doSubmit}>
      <input type="submit" class="btn btn-primary" value="送信" />
      </form>

      <hr/>
      （参考）　
      <a href="https://docs.google.com/forms/create?hl=JA">Googleフォーム</a>のリンクURLを本文に貼るとイベント参加可否などアンケートがとれますよ。


      <h1><center><font color="red">{this.state.send}</font></center></h1>





    </div>



  }

}


function send_InputData2backend(props){

  //var url = process.env.MYDOMAIN + "/api/upload";
  var url_text = process.env.REACT_APP_MYDOMAIN + "/api/upload/text";   //REACTの環境変数は REACT_APP_* をつける必要性有
  var url_file = process.env.REACT_APP_MYDOMAIN + "/api/upload/file";

  //var url = "https://jsonplaceholder.typicode.com/posts";
  
  console.log("text = " + props.text);
  console.log("pass = " + props.pass);
  console.log("board = " + props.board);

  //console.log("url_text = " + url_text);
  //console.log("url_file = " + url_file);

  /*
  var senddata = {
    text : this.message,
    image : "",
    pass : ""
  }
*/

  const params = new FormData();

  if(props.file == ''){
    /* text only */
    console.log("text only send");
    
    //params.append('text', props.text);
    //params.append('pass', props.pass);

    axios.post( url_text, { props })
      .then(res => {
        console.log("post text only START");
        console.log("res="+res);
        console.log(res)
        console.log("res.data=")
        console.log(res.data)
      })
      .catch(function (error) {
        console.log(error);
      }
    );

  }

  else{
    params.append('board', props.board);
    params.append('text', props.text);
    params.append('file', props.file);
    params.append('pass', props.pass);
    axios.post( 
      url_file, 
      params,
      {
        headers: {
          'content-type': 'multipart/form-data',
        },
      }

    )
    .then((result) => {
      console.log("post START");
      console.log("res=");
      console.log(result);
    })
    .catch(() => {
      console.log('upload failed...');
    });
  }

}

//const rootElement = document.getElementById("root");



/* ====================================================
  メインページ　振り分け　(複数ページ対応 React Router)
  （ページを増やす場合はここを増やすこと ★★★）

  https://reffect.co.jp/react/react-router-6
  ページを増やす場合はここを増やすこと
  ===================================================== */
export default class App extends Component {
  render() {
    return (
        <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/shikanodai/rengo" element={<PageRengo />} />
        <Route path="/shikanodai/north-salon" element={<PageNorthSalon />} />
        </Routes>
    );
  }
}



//export default App
