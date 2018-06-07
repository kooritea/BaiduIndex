<template>
  <form v-bind:action='source' id='text_search' class="textSerch">
    <input type="text" v-bind:name="key" id="input" autocomplete="off" v-model='input' @keyup.up="chighlighted(1)" @keyup.down="chighlighted(0)" v-on:input="getinfo()" v-on:propertychange="getinfo()" v-focus>
    <img class="imgicon" src="../assets/pic.svg" v-on:click="$store.state.search='img'">
    <div class="list" v-on:mousemove='input_status=false'>
      <ul id='list' v-on:mouseout="highlightedb=highlighted;highlighted=(-1)">
        <li v-for="(sug,index) in suggets" v-bind:class='{highlighted:(highlighted===index)}' v-on:mouseover="highlighted=index" v-on:click="submit">{{sug}}</li>
      </ul>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SearchText',
  data () {
    return {
      input:'',
      input_tem:'',
      suggets:[],
      highlighted:(-1),//高亮位置
      highlightedb:null,//高亮位置暂存
      input_status:false//再输入状态时为true,防止在输入时鼠标触碰suggets
    }
  },
  props: ['sourceName'],
  computed:{
    source(){
      switch(this.sourceName){
        case 'google':
          return 'https://www.google.com/search'
        case 'baidu':
          return 'https://www.baidu.com/s'
      }
    },
    key(){
      switch(this.sourceName){
        case 'google':
          return 'q'
        case 'baidu':
          return 'wd'
      }
    }
  },
  methods:{
    chighlighted(type){//更改高亮位置
      if(this.highlightedb){//恢复鼠标离开选项前的位置
        this.highlighted = this.highlightedb;
        this.highlightedb = null;
      }
      this.input_status = false;
      if(type && this.highlighted >= 0){//up
        this.highlighted --
      }
      if(!type && this.highlighted<this.suggets.length){//down
        this.highlighted ++
      }
      if(this.highlighted === (-1)||this.highlighted === (this.suggets.length)){
        this.input = this.input_tem;
      }
    },
    submit(){
      location.href=`${this.source}?${this.key}=${this.input}`
    },
    async getinfo(){//获取百度suggets
      this.input_status=true;
      this.input_tem = this.input;
      let json = await this.$jsonp('https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',{
        wd:this.input,
        callbackQuery:'cb'
      })
      this.suggets = json.s
    }
  },
  watch:{
    highlighted(){
      if(this.highlighted !== (-1) && this.highlighted !== (this.suggets.length) && !this.input_status){
        this.input = this.suggets[this.highlighted]
      }
      if(this.highlighted === (-1)){
        this.input = this.input_tem;
      }
    }
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.textSerch ul{
  margin: 0;
  padding:0;
  border-width: 0px 1px 1px 1px;
  border-style: solid;
  border-color: #eee;
}
.textSerch li{
  margin: 0;
  padding:0;
  list-style: none;
  text-align: left;
  padding: 2px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 15px;
}
.textSerch .highlighted{
  background-color: #97c9eb;
}
</style>
