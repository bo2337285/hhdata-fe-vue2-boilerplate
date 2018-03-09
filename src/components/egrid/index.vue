<template lang="html">
  <div class="">
    <el-table style="border:none;" border height="300" :fit="false" :data="currentPageData"
        @selection-change="!!onSelection? onSelection : ()=>{}">
      <el-table-column v-if="!!onSelection" type="selection" width="50"/>
      <el-table-column v-for="col in cols" :width="col.width" show-overflow-tooltip
        :sortable="col.sortable" :fixed="col.fixed" :property="col.name" :label="col.text" />
      <slot name="operator"/>
    </el-table>

    <div class="clearfix">
      <el-pagination style="float:right;"
        @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize" :total="data.length"
        layout="total, sizes, prev, pager, next, jumper" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Element from 'element-ui';
Vue.use(Element)

export default {
  props: ['data','cols','onSelection'],
  data() {
    return {
      pageSizes: [10,50,100],
      pageSize: 10,
      currentPage: 1,
      currentPageData:[],
    };
  },
  watch: {
    currentPage: function (val,oldVal) {
      this.getCurrData();
    },
    data: function (val,oldVal) {
      this.getCurrData();
    },
    pageSize: function (val,oldVal) {
      this.getCurrData();
    },
  },
  methods: {
    getCurrData: function () {
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      this.currentPageData = this.data.slice(start,end)
    },
    handleCurrentChange: function (currentPage) {
      this.currentPage = currentPage
    },
    handleSizeChange: function (pageSize) {
      this.pageSize = pageSize
    }
  }
};
</script>
