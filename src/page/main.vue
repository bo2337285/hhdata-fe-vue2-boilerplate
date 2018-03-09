<template>
  <div id="main">
    <!-- 头部导航 -->
    <div class="header" :class="{ 'header-fixed' : headerFixed }">
      <div class="header-content-left">
        <div title="菜单收纳" class="menu-btn" @click="toggleMenu">
          <i class="fa fa-bars" aria-hidden="true"/>
        </div>
        <el-autocomplete
          class="focusQuery"
          v-model="menuQuery"
          :fetch-suggestions="querySearch"
          @select="queryMenuSelect"
          style="width:150px;"
          placeholder="搜索菜单..." >
          <i slot="append" class="fa fa-search" aria-hidden="true"/>
        </el-autocomplete>
      </div>
      <div class="header-content-right">
        <div title="消息" class="menu-btn">
          <el-badge  :value="tips.length" :max="99"  class="badge-tips">
            <i class="fa fa-bell" aria-hidden="true"/>
          </el-badge>
        </div>
        <el-popover
          ref="userInfo"
          placement="bottom"
          trigger="hover"
          >
          {{loginName}}
        </el-popover>
        <el-button title="用户信息" class="menu-btn" v-popover:userInfo>
          <i class="fa fa-user-circle" aria-hidden="true"/>
        </el-button>

      </div>
    </div>

    <div class="main">
      <div class="main-wrap">
        <!-- 左侧导航 -->
        <div class="main-left" :style="{width:isShowMenu?'200px':'0px'}">
          <imenu :data="menu" :currTab="currTab" :selectMenu="selectMenu"/>
        </div>

        <!-- 右侧主内容区 -->
        <div  class="main-right" >
          <transition>
            <el-tabs class="tabs" v-model="currTab" type="card" @tab-click="selectTab" @edit="editTab" style="width:100%">
              <el-tab-pane class="tabs-panel" label="首页" name="home" :closeable="false">
                <component is="portal" />
              </el-tab-pane>
              <el-tab-pane class="tabs-panel" v-for="(item, index) in tabs" :label="item.name" :name="item.menuKey" :closable="true" >
                <component :is="item.route" />
              </el-tab-pane>
            </el-tabs>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getMenu} from 'src/service/getData'
import 'src/assets/css/main.less';
import components from './pages';
// import 'font-awesome/less/font-awesome.less';

import $ from 'jquery'
import _ from 'lodash'

import imenu from 'src/components/menu/index'

function Item(d) {
  this.id = d.id;
  this.menuKey = d.menuKey;
  this.pKey = d.pKey;
  this.route = d.route;
  this.isOpen = d.isOpen;
  this.isEnable = d.isEnable;
  this.icon = d.icon;
  this.name = d.name;
  this.parent;
  this.children;
  this.value = d.name;
}

export default {
  name: 'main',
  data (){
    return {
      currTab: 'home',
      isShowMenu: true,
      tabs: [],
      tabIndex: 2,
      menu : [],
      active:true,
      headerFixed : false,
      menuQuery: '',
      loginName: '',
      tips: [{aa:111}]
    }
  },
  created: function(){
    this.initMenu();
    window.app = this;
  },
  methods: {
    querySearch(queryString, cb) {
      var restaurants = this.menu.filter((item) => {
        return (!!item.route && !!item.isEnable);
      });
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return (item) => {
        return (item.name.indexOf(queryString.toLowerCase()) === 0);
      };
    },
    queryMenuSelect(item) {
      var app = this;
      app.currTab = item.menuKey;//对应item.menuKey
      app.selectMenu(item.menuKey);
    },
    refreshView: function () {
      setTimeout(()=>$(window).trigger('resize'),100)
    },
    initMenu : async function () {
       let res = await getMenu();
       this.loginName = res.data.loginName;
       this.menu = _.map(res.data.menus, (d)=> {
         return new Item(d)
       });
    },
    selectMenu : function(tabIdx){
      var app = this;
      app.currTab = tabIdx;//设置当前tab标号
      let curr = this.menu.find((o)=>{
        return o.menuKey == tabIdx;
      })
      if (!!!_.find(app.tabs, { 'menuKey': tabIdx })) {//不存在打开菜单
        app.addTab(curr)
      }else{
        this.refreshView();
      }
    },
    selectTab : function (tab) {
      var app = this;
      app.currTab = tab.name;//对应item.menuKey
      this.refreshView();
    },
    addTab : function(tab){
      var app = this;
      app.tabs.push(tab);
    },
    editTab : function (targetName,action) {
      if (action === 'remove'){
        let tabs = this.tabs;
        let activeName = this.currTab;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.menuKey === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.menuKey;
              }
            }
          });
        }
        this.currTab = activeName;
        this.tabs = tabs.filter(tab => tab.menuKey !== targetName);
      }
    },
    toggleMenu: function () {
      this.isShowMenu = !this.isShowMenu;
      this.refreshView();
    }
  },
  components: $.extend(true,{imenu:imenu},components) ,
  // components: {
  //   portal
  // },
}
</script>
