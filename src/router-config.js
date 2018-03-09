import App from './App';
import {isPro,baseUrl} from 'src/config/env.js'
const main = r => require.ensure([], () => r(require('./page/main.vue')), 'main')
const login = r => require.ensure([], () => r(require('./page/login.vue')), 'login')
const NotFoundComponent = r => require.ensure([], () => r(require('./page/404.vue')), 'NotFoundComponent')

export default [
  // { path: '/', component: NotFoundComponent },
  // { path: '/', redirect: to => {debugger;
  //     // 方法接收 目标路由 作为参数
  //     // return 重定向的 字符串路径/路径对象
  //     return '/login';
  //   } },
  // {path: !isPro?'/':baseUrl.slice(0,baseUrl.length-1),
  {path: '/',
    component: App, //顶层路由，对应index.html
    children:[
      { path: '', component: login},
      { path: 'index', component: main},
    ]},
  { path: '*', component: NotFoundComponent },
  // { path: '/', component: login, name: 'login' },
  // { path: '/index', component: main, name: 'index' },
]
