<template lang="html">
  <table id="grid"/>
</template>

<script>
import './index.less'
import $ from "./src/jquery.hhdata.gridlist";
import "./src/jquery.hhdata.gridlist.css";

export default {
  name:'grid',
  props: ['options','data','cols'],
  data() {
    return {
      grid: null
    };
  },
  mounted: function(){
    this.grid = $(this.$el).gridList(this.options);
    this.grid.setHeader(this.cols);
    this.grid.updateData(this.data);
  },
  watch: {
    data: {
      handler:function () {
        this.grid.updateData(this.data);
      },
      deep: true
    },
    cols: {
      handler:function () {
        this.grid.setHeader(this.cols);
      },
      deep: true
    }
  },
  methods: {},
  components: {}
};
</script>
