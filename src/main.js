/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import storeOption from './vuex/store'
import '@/assets/javascript/application.js'
import '@/assets/stylesheet/application.scss'

/**
 * Use Vuex
 * 建立一個 store 物件用來管理 app 的資料
 */
Vue.use(Vuex)
const store = new Vuex.Store(storeOption)

Vue.config.productionTip = false

/**
 * facebook sdk
**/
;(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/zh_TW/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
