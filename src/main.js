// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import App from './page/activePublic/index.vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import routes from './router-config'

import store from './store/index'
import {baseUrl,routerMode,isPro} from 'src/config/env'
// import store from './store.js'

//加载路由中间件
Vue.use(VueRouter)
Vue.use(VueResource)

// console.log(routes);

//定义路由
const router = new VueRouter({
  routes,
  mode: routerMode,
  strict: !isPro
})

// router.beforeEach(function(to, from, next) {
//     next()
// })

new Vue({
  router,
  store,
  el: "#app",
  render: h => h(App)
})
