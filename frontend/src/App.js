import React, { Component } from 'react'
import axios from 'axios';
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';



class Root extends Component {
  render() {
    return <h1>rootです</h1>;
  }
}

class PageRengo extends Component{
  render() {
    return <h2>鹿ノ台連合会です</h2>;
  }
}

class PageNorthSalon extends Component {
//class App extends Component {

  inputText = ''
  inputFile = ''
  inputPass = ''

  constructor(props){
    super(props)
    this.state = {
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
  }

  doTextChange(event){

    this.inputText = event.target.value;

    //event.preventDefault()
  }

  doFileChange(event){

    this.inputFile = event.target.files[0];
    console.log("inputFile="+this.inputFile);
    
  }

  doPassChange(event){
    this.inputPass = event.target.value;
    console.log("inputPass="+this.inputPass);
  }

  doSubmit(event){
    
    //console.log("input="+this.input);
    this.setState({
      send: '送信しました！',
      message: this.inputText,
      file: this.inputFile,
      pass: this.Pass
    })

    var senddata = {
      //text: "abc"
      text: this.inputText,
      //message: this.inputText,
      //image : " ",
      file: this.inputFile,
      pass : this.inputPass
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


      <h1 class="bg-primary text-white display-4">デジタル回覧板</h1>

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
  var url_text = "https://dev-degital-kairanban.herokuapp.com/api/upload/text";
  var url_file = "https://dev-degital-kairanban.herokuapp.com/api/upload/file";
  
  //var url = "https://jsonplaceholder.typicode.com/posts";

  console.log("text = " + props.text);
  console.log("pass = " + props.pass);

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

const rootElement = document.getElementById("root");


// 複数ページ対応 React Router
// https://reffect.co.jp/react/react-router-6
// ページを増やす場合はここを増やすこと

export default class App extends Component {
  render() {
    return (
        <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/north-salon" element={<PageNorthSalon />} />
        <Route path="/rengo" element={<PageRengo />} />
        </Routes>
    );
  }
}



//export default App
