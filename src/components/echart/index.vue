<template>
  <div id="chart" :style="{height: height + 'px',width: width + 'px'}" />
</template>

<script>
import ec from 'echarts'
import $ from 'jquery'
import de from 'lodash.debounce'

export default {
  name: 'chart',
  data: function (){
    return {
      chart : {}
    }
  },
  props: ['options','width','height'],
  mounted : function () {
    this.chart = ec.init(this.$el)
    var chart = this.chart;
    var dom = this.$el;
    chart.setOption(this.options);
    $(window).on('resize',de(function(e) {
      if ($(dom).is(":visible")) {
        e.preventDefault();
        chart.resize();
      }
    },500));
  },
  updated: function () {
    // console.log(this.height);
    // this.chart.resize();
  },
  watch: {
    options: {
      handler: function (val,oldVal) {
        this.chart.setOption(val,true);
        // this.$nextTick(function () {
        // })
      },
      deep: true
    },
    height: {
      handler: function (val,oldVal) {
        this.$nextTick(function () {
          this.chart.resize();
        })
      }
    }
  }
}

</script>
