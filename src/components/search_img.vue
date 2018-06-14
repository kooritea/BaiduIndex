<template>
  <div class="imgSearch">
    <form action='https://image.baidu.com/n/pc_search' id='img_search'>
     <input type="text" name="queryImageUrl" class="input_url" id="input_url" autocomplete="off" placeholder='在此输入图片url' v-model='input_url' v-focus>
     <a v-bind:href="searching"><div class="searching">搜索</div></a>
     <select id="source" class="source" v-model='source'>
       <option value="https://image.baidu.com/n/pc_search?queryImageUrl=">百度</option>
       <option value="https://images.google.com/searchbyimage?image_url=">Google</option>
       <option value="http://saucenao.com/search.php?db=999&url=">sauceNAO</option>
       <option value="http://iqdb.org/?url=">iqdb</option>
       <option value="http://tineye.com/search/?url=">TinEye</option>
       <option value="http://pic.sogou.com/ris?flag=1&query=">搜狗</option>
       <option value="https://whatanime.ga/?url=">whatanime</option>
     </select>
     <div id="copyurl" class="copyurl" v-on:click="copyurl(input_url)" v-if='input_url'>复制链接</div>
     <div class="prompt" ref="prompt" >复制成功</div>
     <div style="position: relative;">
       <label for="selectfile" class="selectfile">
         <div class="upload_img" id="upload_img" v-on:dragenter='upload_img_logo=false' v-on:dragleave='upload_img_logo=true' v-on:drop='drop' v-on:dragover='dragover'>
           <p>拖拽图片或点击此处</p>
           <div class="upload_img_file" id="upload_img_file">
             <img class="upload_img_logo" src="../assets/add.svg" v-if="upload_img_logo&&!upload_img_example">
             <img class="upload_img_logo" src="../assets/file.svg" v-if="!upload_img_logo">
             <img class="upload_img_example" v-if="upload_img_example&&upload_img_logo" v-bind:src="upload_img_example">
             <div class="upload_img_example_bg" v-if="upload_img_example&&upload_img_logo&&upload_img_progress!=100" v-bind:style="{height:(100-upload_img_progress)+'%'}"></div>
           </div>
           <input type="file" id="selectfile" ref="selectfile" style="display: none" v-on:change="upload_img()">
         </div>
       </label>
       <div class='back' v-on:click="$store.state.search='text'">
         <img src="../assets/back.svg" class="back">
       </div>
     </div>
   </form>
   <div class="history" ref='history'>
       <div class="placeholder">
         <!-- 占位用 -->
       </div>
       <div class="son" v-on:click="item.meau = true" v-for="(item,index) in filterhistory" :key="index">
         <img v-bind:src="'http://ww2.sinaimg.cn/mw690/'+item.pid" v-on:error="item.pid='005zWjpngy1fqfxazqlx2j308k08k75v'" v-on:load="setScroll">
         <div class="filter" v-if="!item.show"></div>
         <div class="meau" v-if="item.meau" v-on:mouseleave.self="item.meau=false">
           <div v-on:click="copyurl('http://ww2.sinaimg.cn/large/'+item.pid)">复制链接</div>
           <div v-on:click="view(item.pid)">查看大图</div>
           <div v-if="item.show" v-on:click="setShow(item,false)">隐藏</div>
           <div v-else="item.show" v-on:click="setShow(item,true)">取消隐藏</div>
           <div v-on:click="delHistory(item)">删除</div>
         </div>
       </div>
       <div class="placeholder">
         <!-- 占位用 -->
       </div>
    </div>
    <div class="imgView" v-if="imgView" v-on:click="imgView=false">
      <img v-bind:src="imgViewSrc" />
    </div>
  </div>

</template>
<script>
import Clipboard from 'clipboard';
import easyIDB from '../assets/script/easyIDB.js'
export default {
  name: 'SearchImg',
  data () {
    return {
      input_url:'',
      api:null,
      upload_img_logo:true,//true时显示add.svg或者example，false时显示file.svg
      upload_img_example:null,
      upload_img_progress:0,//上传进度
      source:'https://image.baidu.com/n/pc_search?queryImageUrl=', //搜索源
      prompt:null,
      history:[
        // {
        //   pid:"",
        //   show:true,
        //   meau:false
        // }
      ],
      hidden:false,//是否隐藏被隐藏的图片
      DB:null,
      imgView:false,
      imgViewSrc:""
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
  	},
    filterhistory(){
      if(this.hidden){
        return this.history.filter(function(history){
					return history.show === true
				})
      }
      else{
        return this.history
      }
    }
  },
  methods:{
  	drop(e){//拖拽释放后出发
  		e.preventDefault();
      this.input_url = '';//清空
      this.upload_img_example=null;//显示文件svg
  		this.upload_img(e.dataTransfer.files[0])
  		return false
  	},
  	dragover(e){//坑
  		e.preventDefault();
  		return true;
  	},
  	async upload_img(file){
  		file = file||this.$refs.selectfile.files[0]
      this.example(file)//显示预览
      let pid = await this.up(file)
  		this.input_url = 'http://ww2.sinaimg.cn/large/'+pid
      this.save(pid)
  	},
  	async example(file){
  		let reader = new FileReader();
  		reader.readAsDataURL(file);
  		this.upload_img_example = await (new Promise(async function(reslove,reject){
				reader.onload = function (e) {
					reslove(this.result);
				}
			}))
      this.upload_img_logo = true;
  	},
  	async up(file){//上传至新浪
  		let api = this.api||await this.getapi()
      this.upload_img_progress=0
      let vm = this
     	return new Promise(async function(reslove){
     		let data = new FormData();
     		data.append("file", file);
     		let s = new XMLHttpRequest()
     		s.open("POST", api, true);
     		s.onreadystatechange=function(){
    			if (s.readyState == 4) {
    				let g = s.responseText;
    				if((s.getResponseHeader("Content-Type") || "").match(/json/)){
    					let  pid = (JSON.parse(g)).wbpid
    					reslove(pid)
    				}
    				else{
    					alert('上传失败')
    				}
    			}
    		}
        s.upload.onprogress = function(event){
          vm.upload_img_progress = (event.loaded/event.total)*100
        }
  			s.send(data);
  	 })
  	},
    setShow(item,val){
      let index = this.history.indexOf(item)
      this.history[index].show = val;
      this.DB.edit('history','pid',this.history[index].pid,{show:val})
    },
    delHistory(item){
      if(!confirm("你确认要删除这条历史吗？")){
        return
      }
      let index = this.history.indexOf(item)
      this.DB.del('history','pid',this.history[index].pid)
      this.history.splice(index,1)
    },
    async save(pid){
      let data = {
        pid:pid,
        show:true,
        meau:false
      }
      this.history.push(data)
      await this.DB.push('history',data)
    },
    async load(){
      this.history = await this.DB.get('history')
      this.$nextTick(()=>{
        this.setScroll()
      })
    },
    view(pid){
      this.imgViewSrc = `http://ww2.sinaimg.cn/large/${pid}`
      this.imgView = true
    },
    copyurl(url){
      let div = document.createElement('div')
      new Clipboard(div ,{
        text:function(trigger){
          return url
        }
      })
      div.click()
      this.showprompt('复制成功')
    },
    setScroll(){
      let vm = this
      let setScroll = function(){
        setTimeout(function(){//抱歉，我不知道为什么这里没有按照预想中的更新视图后修改滚动条的高度，只能用延时了
          if(vm.$refs.history.scrollTop + vm.$refs.history.offsetHeight !== vm.$refs.history.scrollHeight){
            vm.$refs.history.scrollTop = vm.$refs.history.scrollHeight;//给各位前段丢脸了
            setScroll()
          }
        },100)
      }
      setScroll()
    },
    async showprompt(prompt){
      this.prompt=prompt
      this.$refs.prompt.style.opacity=1
      await new Promise(async function(reslove){
        setTimeout(function(){
          reslove(1)
        },1000)
      })
      this.$refs.prompt.style.opacity=0
    },
  	async getapi(){//获取上传地址
      this.api = 'http://'+(await this.axios.get('http://danmu.fm/api/hosts')).data.cmcc.match(/[\d\.]+/)+':672/v1/upload';
  		return this.api
  	},
    async initDB(){
      let newIndexs = [
          {
            name:"history",
            indexs:[
              {
                name:"pid"
              },
              {
                name:"show"
              }
            ],
            option:{
              keyPath:'id',
              autoIncrement:true
            }
          }
        ]
      this.DB = await easyIDB('history',newIndexs);
      this.load();
    }
  },
  async mounted(){
   this.initDB()
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
.imgSearch .input_url{
  font-size: 12px;
  color: #888;
}
.imgSearch .upload_img{
  overflow-y: hidden;
  position: relative;
  border: 1px #97c9eb solid;
  cursor: pointer;
}
.imgSearch .upload_img p{
  margin:5px 0;
  pointer-events: none;
}
.imgSearch .upload_img .upload_img_file{/*拖拽框*/
  position: relative;
  margin: 0 auto 35px auto;
  width: 80%;
  min-height: 100px;
  border: dashed 5px #eee;
  pointer-events: none;
}
.imgSearch .upload_img .upload_img_logo{/*拖拽框中间的图标*/
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  height: 50px;
  pointer-events: none;
}
.imgSearch .upload_img .upload_img_example{/*预览*/
  max-height: 300px;
  max-width: 485px;
  pointer-events: none;
}
.imgSearch .upload_img .upload_img_example_bg{/*上传进度黑色遮影*/
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0,0,0,0.5);
}
.imgSearch .back{
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 50px;
  height: 50px;
  cursor: pointer;
}
.imgSearch .back:hover{
  background-color: #eee;
}
.imgSearch .back img{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  height: 20px;
}
.imgSearch .searching{/*图片搜索按钮*/
  height: 32px;
  position: absolute;
  right: 0;
  width: 60px;
  line-height: 32px;
  top: 0;
  cursor: pointer;
  color: #000;
}
.imgSearch .searching:hover{
  background-color: #97c9eb;
}
.imgSearch .copyurl{/*图片复制按钮*/
  position: absolute;
  right:70px;
  line-height: 32px;
  top: 0;
  cursor: pointer;
}
.imgSearch .copyurl:hover{
  text-decoration: underline;
}
.imgSearch .source{
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
.imgSearch .prompt{
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
.imgSearch .prompt img{
  width: 50px;
  height: 20px;
}
.imgSearch .history{
  position: fixed;
  right: 0;
  top:0;
  height: 100vh;
  overflow-y: auto;
  max-width: 200px;
}
.imgSearch .history::-webkit-scrollbar{
  display:none;
}
.imgSearch .history .son{
  cursor: pointer;
  position: relative;
  width: 150px;
  float: right;
  overflow: hidden;
}
.imgSearch .history .son:hover{
  width: 200px;
}
.imgSearch .history .son img{
  width: 100%;
  display: block;
  position: relative;
  user-select: none;
}
.imgSearch .history .son .filter{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255,255,255,0.8)
}
.imgSearch .history .son .meau{
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  background-color: rgba(0,0,0,0.5);
  animation: showmeau 0.2s forwards;
}
.imgSearch .history .son .meau div{
  color: #fff;
  font-size: 20px;
  width: 50%;
  height: 50%;
  float: left;
  font-size: 15px;
}
.imgSearch .history .son .meau div:hover{
  background-color: #97c9eb;
  color: #000;
}
.imgSearch .history .son .meau div:after{
  display:inline-block;
  width:0;
  height:100%;
  vertical-align:middle;
  content:"";
}
@keyframes showmeau {
  from{top:-100%}
  to{top:0}
}
.imgSearch .history .placeholder{
  height: 40vh;
  float: right;
  width: 150px;
}
.imgSearch .imgView{
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.5);
}
.imgSearch .imgView img{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  max-width: 100%;
  max-height: 100%;
}
</style>
