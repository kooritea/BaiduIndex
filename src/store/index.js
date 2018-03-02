import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    search: 'text'
  },
  mutations: {
    change (state,playload) {
  		if(state.search === 'text'){
  			state.search = 'img'
  		}
  		else{
  			state.search = 'text'
  		}
    }
  }
})

export default store