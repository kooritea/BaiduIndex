<template>
  <div id="app" v-on:dragenter="$store.state.search='img'">
   <div class="moeBg">
    <img v-on:click="changeSource" draggable="false" class='moe' id = 'img' v-bind:src='moeurl'>
   </div>
   <div class="main">
     <SearchText v-bind:sourceName="source" v-if="$store.state.search==='text'"/>
     <SearchImg v-if="$store.state.search==='img'"/>
   </div>
  </div>
</template>

<script>
import SearchText from './components/search_text'
import SearchImg from './components/search_img'
import moe1 from './assets/moe1.png'
import moe2 from './assets/moe2.png'
import moe3 from './assets/moe3.png'
export default {
  name: 'App',
  components: {
    SearchText,
    SearchImg
  },
  data(){
    return {
      source:localStorage.source||'google',
      moe:[moe1,moe2]
    }
  },
  computed:{
    moeurl(){
      switch(this.source){
        case 'google':
          return moe3
        case 'baidu':
          return this.moe[((Math.floor(Math.random()*10)>4)?1:0)]
      }
    }
  },
  methods:{
    changeSource(){
      this.source = this.source === 'google'?'baidu':'google'
      localStorage.source = this.source
    }
  }
}
</script>

<style>
body{
  margin: 0;
  overflow-x: hidden;
}
#app {
  width: 100vw;
  height: 100vh;
  min-width: 820px;
}
/* .main{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
} */
.moeBg{
  text-align: center;
}
.moeBg .moe{
  position: relative;
  margin:0 auto;
  height: 350px;
  user-select: none;
}
.main{
  position: relative;
  margin:0 auto;
  width: 612px;
  text-align: center;
}
.main form{
  position: relative;
  top:-20px;
  height: 32px;
}
.main form .imgicon{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
  height: 20px;
  cursor: pointer;
}
.main form input{
  width: 600px;
  height: 30px;
  padding: 0 0 0 10px;
  outline: none;
  border:1px solid #97c9eb;
  font-size: 18px;
}
</style>
