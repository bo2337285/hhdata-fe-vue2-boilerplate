import Vue from 'vue'
import Vuex from 'vuex'
import constant from 'src/store/constant';

Vue.use(Vuex)
/* 活动管理测试数据 */
/*
 * ruleForm  1、活动信息的表单
 * signFrom  2、报名的表单
 * shareFrom 3、报名的表单
 * selfFrom  4、个性设置的表单
 * activeList 活动列表
 * */
const state = {
    ruleForm: constant.RULEFORM,
    signForm: {},
    shareForm: {},
    selfForm: {},
    activeList:constant.DATA
}

/* 从本地存储读取数据 */
for(var item in state){
  localStorage.getItem(item)?
    state[item] = JSON.parse(localStorage.getItem(item)): false;
}

const mutations = {
    setRuleForm(state, payload) {
        Object.assign(state.ruleForm, payload);
        localStorage.setItem('ruleForm',JSON.stringify(payload));
    },
    setSignForm(state, payload) {
        Object.assign(state.signForm, payload);
      localStorage.setItem('signForm',JSON.stringify(payload));

    },
    setShareForm(state, payload) {
        Object.assign(state.shareForm, payload);
      localStorage.setItem('shareForm',JSON.stringify(payload));
    },
    setSelfForm(state, payload) {
        Object.assign(state.selfForm, payload);
      localStorage.setItem('selfForm',JSON.stringify(payload));
    },
    updatePageState(state, arg) {
      state[arg.url] = Object.assign(state[arg.url] || {}, arg.payload);
      // localStorage.setItem(arg.url, JSON.stringify(arg.payload));
    }
}

export default  new Vuex.Store({
    state,
    mutations
})
