<template lang="html">
  <app/>
</template>

<script>
// import app from './app'
const app = r => require.ensure([], () => r(require('./app.vue')), 'app')
export default {
  data() {
    return {
    };
  },
  computed: {},
  ready() {},
  attached() {},
  methods: {},
  components: {app}
};
</script>

<style lang="css">
</style>
