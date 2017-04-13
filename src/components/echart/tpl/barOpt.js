export default {
  tooltip: {},
  grid: {right:60,left:60},
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
  }],
  dataZoom: [
        {
            type: 'slider',
            show: true,
            end:20,
            xAxisIndex: [0],
        },
        {
            type: 'inside',
            end:20,
            xAxisIndex: [0],
        }

    ],
}
