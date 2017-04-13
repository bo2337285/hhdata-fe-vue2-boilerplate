import App from './App.vue'
// const NotFoundComponent = r => require.ensure([], () => r(require('./page/404.vue')), 'NotFoundComponent')
// const activePublic = r => require.ensure([], () => r(require('./page/activePublic/index.vue')), 'activePublic')
// const activeManage = r => require.ensure([], () => r(require('./page/activeManage/index.vue')), 'activeManage')
// const anaPage = r => require.ensure([], () => r(require('./page/anaPage/index.vue')), 'anaPage')
// const testPage = r => require.ensure([], () => r(require('./page/testPage/index.vue')), 'testPage')
// const gridTest = r => require.ensure([], () => r(require('./page/gridTest/index.vue')), 'gridTest')

export default [
  // {path: '*', component: NotFoundComponent },
  {path: '/',
    components: {
        // activePublic,
        // activeManage,
        // anaPage,
        // testPage,
        // gridTest,
    }
  }
]
