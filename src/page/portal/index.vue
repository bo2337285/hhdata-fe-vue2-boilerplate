<template lang="html">
  <div id="portal">
    <h1>{{portalText}}</h1>
    <el-input v-model="height" placeholder="请输入内容"/>
    <el-switch v-model="isBarView" on-color="#13ce66" off-color="#ff4949" on-text="柱图" off-text="饼图" @click="switchChart" />
    <!-- <el-button type="primary" @click="switchChart">正常按钮</el-button> -->
    <echart :options="chartOpts" :height="height"/>
  </div>
</template>

<script>
import echart from 'src/components/echart/index'

let chartOpts = {
      tooltip: {},
      legend: {
          data:['销量']
      },
      xAxis: {
          data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
      },
      yAxis: {},
      series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
      }]
  };

let chartOpts1 = {
    backgroundColor: '#2c343c',

    title: {
        text: 'Customized Pie',
        left: 'center',
        top: 20,
        textStyle: {
            color: '#ccc'
        }
    },

    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },

    visualMap: {
        show: false,
        min: 80,
        max: 600,
        inRange: {
            colorLightness: [0, 1]
        }
    },
    series : [
        {
            name:'访问来源',
            type:'pie',
            radius : '55%',
            center: ['50%', '50%'],
            data:[
                {value:335, name:'直接访问'},
                {value:310, name:'邮件营销'},
                {value:274, name:'联盟广告'},
                {value:235, name:'视频广告'},
                {value:400, name:'搜索引擎'}
            ].sort(function (a, b) { return a.value - b.value}),
            roseType: 'angle',
            label: {
                normal: {
                    textStyle: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                }
            },
            labelLine: {
                normal: {
                    lineStyle: {
                        color: 'rgba(255, 255, 255, 0.3)'
                    },
                    smooth: 0.2,
                    length: 10,
                    length2: 20
                }
            },
            itemStyle: {
                normal: {
                    color: '#c23531',
                    shadowBlur: 200,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },

            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
                return Math.random() * 200;
            }
        }
    ]
};

export default {
  name: 'portal',
  data() {
    return {
      isBarView : true,
      height: 300,
      portalText : "首页",
      chartOpts: chartOpts
    };
  },
  computed: {},
  ready() {},
  watch: {
    isBarView: function (nVal) {
      this.chartOpts = nVal? chartOpts : chartOpts1;
    }
  },
  methods: {
    switchChart : function () {
      this.chartOpts = chartOpts1;
    }
  },
  components: {
    echart: echart
  }
};
</script>

<style lang="css">
</style>
