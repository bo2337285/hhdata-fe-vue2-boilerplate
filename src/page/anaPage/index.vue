<template lang="html">
  <app v-if="loaded"/>
</template>

<script>
// import app from './app'
const app = r => require.ensure([], () => r(require('./app.vue')), 'app')
export default {
  data() {
    return {
      loaded: false
    };
  },
  created() {
    let _self = this;
    setTimeout(function () {
      _self.loaded = true;
    },1000)
  },
  components: {app}
};
</script>

<style lang="css">
</style>
