import React, { Component } from 'react'
import axios from 'axios';
import './App.css'


class App extends Component {

  input = ''

  constructor(props){
    super(props)
    this.state = {
      send: '',
      message:''
    }
    this.doChange = this.doChange.bind(this)
    this.doSubmit = this.doSubmit.bind(this)
    this.doDeleteFile = this.doDeleteFile.bind(this)
    this.doCertification = this.doCertification(this)
  }

  doChange(event){

    this.input = event.target.value;

    //event.preventDefault()
  }

  doSubmit(event){
    
    //console.log("input="+this.input);
    this.setState({
      send: '送信しました！(添付ファイルはまだ未対応)',
      message: this.input
    })

    var senddata = {
      //text: "abc"
      text: this.input,
      image : " ",
      pass : "163"
    }
    send_InputData2backend(senddata)

    event.preventDefault()
  }

  doDeleteFile(event){

  }

  doCertification(event){

  }

  


  render(){
    return <div class="container">


      <h1 class="bg-primary text-white display-4">デジタル回覧板</h1>

      <div class="form-group">
        <label for="inputText">送信文面</label>
        <textarea class="form-control" rows="8" maxlength="5000" onChange={this.doChange} />
      </div>


      <div class="form-group">
        <label for="inputFile">添付ファイル（オプション）</label>
        <div class="input-group">
          <div class="custom-file">
            <input type="file" class="custom-file-input" id="inputFile" />
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
        <label for="pass">管理者パスワード（これは送信されません）</label>
        <input type="password" class="form-control" onCertification={this.doCertification} />
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

  //var url = process.env.MYDOMAIN + "/api/upload"
  var url = "https://dev-degital-kairanban.herokuapp.com/api/upload"
  //var url = "https://jsonplaceholder.typicode.com/posts"

  console.log("url="+ url)

  /*
  var senddata = {
    text : this.message,
    image : "",
    pass : ""
  }
*/

  axios.post( url, { props })
    .then(res => {
      console.log("post START");
      console.log("res="+res);
      console.log(res)
      console.log("res.data=")
      console.log(res.data)
    })
    .catch(function (error) {
      console.log(error);
    })

}

export default App
