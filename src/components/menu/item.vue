<template lang="html">
  <el-submenu v-if="!!data.children" :index="data.menuKey">
    <template slot="title"><i class="menu-icon fa" :class="data.icon"></i>{{data.name}}</template>
    <item v-for="data1 in data.children" :data="data1" />
  </el-submenu>
  <el-menu-item v-else="!!!data.children" :index="data.menuKey">
    <i class="menu-icon fa" :class="data.icon"></i>{{data.name}}
  </el-menu-item>
</template>

<script>
export default {
  name:'item',
  props: ['data'],
  data() {
    return {
    };
  },
  computed: {},
  ready() {},
  attached() {},
  methods: {},
  components: {}
};
</script>

<style lang="css">
</style>
