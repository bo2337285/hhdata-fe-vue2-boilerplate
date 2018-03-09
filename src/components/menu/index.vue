<template lang="html">
  <el-menu unique-opened theme="dark" :default-active="currTab" class="menu-left" :router="false" @select="selectMenu">
    <mItem v-for="item in treeList" :data="item" />
  </el-menu>
</template>

<script>
import Vue from 'vue'
import mItem from './item'
import './index.less'

//todo menu的data跟tab共用
export default {
  props: ['data','currTab','selectMenu'],
  data() {
    return {
      treeList: this.transToTree(this.data),
      itemList: this.data
    };
  },
  methods: {
    transToTree (sNodes) {
      var i,l,
			key = 'menuKey',
			parentKey = 'pKey',
			childKey = 'children';
			if (!key || key=="" || !sNodes) return [];

			var r = [];
			var tmpMap = {};
			for (i=0, l=sNodes.length; i<l; i++) {
				tmpMap[sNodes[i][key]] = sNodes[i];
			}
			for (i=0, l=sNodes.length; i<l; i++) {
				if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
					if (!tmpMap[sNodes[i][parentKey]][childKey])
						tmpMap[sNodes[i][parentKey]][childKey] = [];
					tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
				} else {
					r.push(sNodes[i]);
				}
			}
			return r;
    }
  },
  watch:{
    data: function () {
      this.treeList = this.transToTree(this.data);
      this.itemList = this.data;
    }
  },
  components: {
    mItem
  }
};
</script>

<style lang="css">
</style>
