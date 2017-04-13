const activeManage = r => require.ensure([], () => r(require('./page/activeManage/index.vue')), 'activeManage');
const activePublic = r => require.ensure([], () => r(require('./page/activePublic/index.vue')), 'activePublic');
const anaPage = r => require.ensure([], () => r(require('./page/anaPage/index.vue')), 'anaPage');
const gridTest = r => require.ensure([], () => r(require('./page/gridTest/index.vue')), 'gridTest');
const portal = r => require.ensure([], () => r(require('./page/portal/index.vue')), 'portal');
const testPage = r => require.ensure([], () => r(require('./page/testPage/index.vue')), 'testPage');

export default {
  activeManage,
  activePublic,
  anaPage,
  gridTest,
  portal,
  testPage,
}