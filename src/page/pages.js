const activeManage = r => require.ensure([], () => r(require('src/page/activeManage/index.vue')), 'activeManage');
const activePublic = r => require.ensure([], () => r(require('src/page/activePublic/index.vue')), 'activePublic');
const anaPage = r => require.ensure([], () => r(require('src/page/anaPage/index.vue')), 'anaPage');
const gridTest = r => require.ensure([], () => r(require('src/page/gridTest/index.vue')), 'gridTest');
const operationLog = r => require.ensure([], () => r(require('src/page/operationLog/index.vue')), 'operationLog');
const portal = r => require.ensure([], () => r(require('src/page/portal/index.vue')), 'portal');
const role = r => require.ensure([], () => r(require('src/page/role/index.vue')), 'role');
const testMs = r => require.ensure([], () => r(require('src/page/testMs/index.vue')), 'testMs');
const testPage = r => require.ensure([], () => r(require('src/page/testPage/index.vue')), 'testPage');

export default {
  activeManage,
  activePublic,
  anaPage,
  gridTest,
  operationLog,
  portal,
  role,
  testMs,
  testPage,
}