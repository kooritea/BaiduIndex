<template>
  <form action='https://www.baidu.com/s' id='text_search'>
    <input type="text" name="wd" id="input" autocomplete="off" v-model='input' @keyup.up="chighlighted(1)" @keyup.down="chighlighted(0)" v-on:input="getinfo()" v-on:propertychange="getinfo()" v-focus>
    <img class="imgicon" src="../assets/pic.svg" v-on:click="$store.state.search='img'">
    <div class="list">
      <ul id='list'>
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
      highlighted:(-1)
    }
  },
  computed:{

  },
  methods:{
    chighlighted(type){//更改高亮位置
      if(type&&this.highlighted >= 0){//up
        this.highlighted --
      }
      if(!type&&this.highlighted<this.suggets.length){//down
        this.highlighted ++
      }
      if(this.highlighted === (-1)||this.highlighted === (this.suggets.length)){
        this.input = this.input_tem;
      }
    },
    submit(){
      location.href='https://www.baidu.com/s?wd='+this.input
    },
    async getinfo(){//获取百度suggets
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
      if(this.highlighted !== (-1)&&this.highlighted !== (this.suggets.length)){
        this.input=this.suggets[this.highlighted]
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
.main ul{
  margin: 0;
  padding:0;
  border-width: 0px 1px 1px 1px;
  border-style: solid;
  border-color: #eee;
}
.main li{
  margin: 0;
  padding:0;
  list-style: none;
  text-align: left;
  padding: 2px 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 15px;
}
.main .highlighted{
  background-color: #97c9eb;
}
</style>
