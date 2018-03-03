<template>
 <form action='https://image.baidu.com/n/pc_search' id='img_search' v-on:submit="submit">
  <input type="text" name="queryImageUrl" class="input_url" id="input_url" autocomplete="off" placeholder='在此输入图片url' v-model='input_url' v-focus>
  <a v-bind:href="searching"><div class="searching">搜索</div></a>
  <select id="source" class="source" v-model='source'>
    <option value ="https://image.baidu.com/n/pc_search?queryImageUrl=">百度</option>
    <option value="https://images.google.com/searchbyimage?image_url=">Google</option>
    <option value ="http://saucenao.com/search.php?db=999&url=">sauceNAO</option>
    <option value="http://iqdb.org/?url=">iqdb</option>
    <option value="http://tineye.com/search/?url=">TinEye</option>
  </select>
  <div id="copyurl" class="copyurl" v-on:click="copyurl()" v-if='input_url'>复制链接</div>
  <div class="prompt" ref="prompt" >复制成功</div>
  <div style="position: relative;">
    <label for="selectfile" class="selectfile">
      <div class="upload_img" id="upload_img" v-on:dragenter='upload_img_logo=false' v-on:dragleave='upload_img_logo=true' v-on:drop='drop' v-on:dragover='dragover'>
        <p>拖拽图片或点击此处</p>
        <div class="upload_img_file" id="upload_img_file">
          <img class="upload_img_logo" src="../assets/add.svg" v-if="upload_img_logo&&!upload_img_example">
          <img class="upload_img_logo" src="../assets/file.svg" v-if="!upload_img_logo">
          <img class="upload_img_example" v-if="upload_img_example&&upload_img_logo" v-bind:src="upload_img_example">
        </div>
        <input type="file" id="selectfile" ref="selectfile" style="display: none" v-on:change="upload_img()">
      </div>
    </label>
    <div class='back' v-on:click="$store.state.search='text'">
      <img src="../assets/back.svg" class="back">
    </div>
  </div>
</form>
</template>
<script>
import Clipboard from 'clipboard';
export default {
  name: 'SearchImg',
  data () {
    return {
      input_url:'',
      api:null,
      upload_img_logo:true,
      upload_img_example:null,
      source:'https://image.baidu.com/n/pc_search?queryImageUrl=', //搜索源
      prompt:null
    }
  },
  computed:{
  	searching(){
  		if(/^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test(this.input_url)){
  			return this.source+encodeURIComponent(this.input_url)
  		}
  		else{
  			return '#'
  		}
  	}
  },
  methods:{
    submit(){//提交表单
      // return this.searching !== '#'?true : false
      return false
    },
  	drop(e){//拖拽释放后出发
  		e.preventDefault();
  		this.upload_img(e.dataTransfer.files[0])
  		this.upload_img_logo=true;
  		return false
  	},
  	dragover(e){//坑
  		e.preventDefault();
  		return true;
  	},
  	async upload_img(file){
  		file = file||this.$refs.selectfile.files[0]
  		this.input_url = await this.up(file)
  		this.example(file)//显示预览
  	},
  	async example(file){
  		let reader = new FileReader();
  		reader.readAsDataURL(file);
  		this.upload_img_example = await (new Promise(async function(reslove,reject){
  				reader.onload = function (e) {
  					reslove(this.result);
  				}
  			}))
  	},
  	async up(file){//上传至新浪
  		let api = this.api||(await this.getapi())
     	return new Promise(async function(reslove,reject){
     		let data = new FormData();
     		data.append("file", file);
     		let s = new XMLHttpRequest()
     		s.open("POST", api, true);
     		s.onreadystatechange=function(){
    			if (s.readyState == 4) {
    				let g = s.responseText;
    				if((s.getResponseHeader("Content-Type") || "").match(/json/)){
    					let  pid = (JSON.parse(g)).wbpid
    					reslove('http://ww2.sinaimg.cn/large/'+pid)
    				}
    				else{
    					alert('上传失败')
    				}
    			}
    		}
  			s.send(data);
  	 })
  	},
    async copyurl(){
      let url = this.input_url
      new Clipboard('.copyurl',{
        text:function(trigger){
          return url
        }
      })
      this.showprompt('复制成功')
    },
    async showprompt(prompt){
      this.prompt=prompt
      this.$refs.prompt.style.opacity=1
      await new Promise(async function(reslove,reject){
        setTimeout(function(){
          reslove(1)
        },1000)
      })
      this.$refs.prompt.style.opacity=0
    },
  	async getapi(){//获取上传地址
  		return 'http://'+(await this.axios.get('http://danmu.fm/api/hosts')).data.cmcc.match(/[\d\.]+/)+':672/v1/upload';
  	}
  },
  mounted(){
   //this.api = this.getapi()
  },
  watch:{
    
  },
  directives: {
    focus:{
      inserted: function (el) {
        el.focus();
      }
    }
  }
}
</script>
<style>
.main .input_url{
  font-size: 12px;
  color: #888;
}
.main .upload_img{
  overflow-y: hidden;
  position: relative;
  border: 1px #97c9eb solid;
  cursor: pointer;
}
.main .upload_img p{
  margin:5px 0;
  pointer-events: none;
}
.main .upload_img .upload_img_file{/*拖拽框*/
  position: relative;
  margin: 0 auto 35px auto;
  width: 80%;
  min-height: 100px;
  border: dashed 5px #eee;
  pointer-events: none;
}
.main .upload_img .upload_img_logo{/*拖拽框中间的图标*/
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  height: 50px;
  pointer-events: none;
}
.main .upload_img .upload_img_example{/*预览*/
  max-height: 300px;
  max-width: 485px;
  pointer-events: none;
}
.main .back{
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 50px;
  height: 50px;
  cursor: pointer;
}
.main .back:hover{
  background-color: #eee;
}
.main .back img{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  height: 20px;
}
.main .searching{/*图片搜索按钮*/
  height: 32px;
  position: absolute;
  right: 0;
  width: 60px;
  background-color: #97c9eb;
  line-height: 32px;
  top: 0;
  cursor: pointer;
  color: #000;
}
.main .copyurl{/*图片搜索按钮*/
  position: absolute;
  right:70px;
  line-height: 32px;
  top: 0;
  cursor: pointer;
}
.main .copyurl:hover{
  text-decoration: underline;
}
.main .source{
  position: absolute;
  top: 3.5px;
  right: -110px;
  appearance:none;
  -moz-appearance:none;
  -webkit-appearance:none;
  width: 100px;
  height: 25px;
  padding-left: 10px;
  text-align: center;
  line-height: 25px;
  background: url("../assets/more.svg") no-repeat scroll right center transparent;
  background-size: 20px;
  background-color: #97c9eb;
  background-position-x:75px; 
  outline: none;
  border: none;
}
.main .prompt{
  position: absolute;
  width: 75px;
  height: 75px;
  right: 60px;
  top: -65px;
  background-image: url(../assets/prompt.svg);
  background-size:cover;
  font-size: 12px;
  line-height: 60px;
  opacity: 0;
  transition: opacity 1s;
}
.main .prompt img{
  width: 50px;
  height: 20px;
}
</style>