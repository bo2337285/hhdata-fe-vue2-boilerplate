<template lang="html">
  <div id="app">
    <transition name="bounce">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import 'element-ui/lib/theme-default/index.css'
import 'font-awesome/less/font-awesome.less';
import 'animate.less/animate.less';
import Element from 'element-ui';
import fetch from 'src/config/fetch'
Vue.use(Element)
export default {
  mounted(){
    window.app = this;
    fetch("post",'/aaaaaaaa')
  }
};
</script>

<style lang="css">
body,html{ position: relative; width: 100%;height: 100%;margin: 0;padding: 0; }
#app{ width: 100%;height: 100%; }
.bounce-enter-active { animation: fadeInLeft .5s; }
.bounce-leave-active { animation: fadeOutRight .5s; }
</style>
