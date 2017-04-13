<template>
  <div id="anaPage">
    <!-- 查询条件 -->
    <el-collapse >
      <el-collapse-item title="查询条件" name="1">
        <el-row>
          <el-col :span="22" >
            <el-form :inline="true" :model="form" class="demo-form-inline">
              <el-form-item :label="form.linkName.label">
                <el-input v-model="form.linkName.val" :name="form.linkName.name" placeholder="链路名称"></el-input>
              </el-form-item>
              <!-- <el-form-item label="活动区域">
                <el-select v-model="form.region" placeholder="活动区域">
                  <el-option label="区域一" value="shanghai"></el-option>
                  <el-option label="区域二" value="beijing"></el-option>
                </el-select>
              </el-form-item> -->
            </el-form>
          </el-col>
          <el-col :span="2">
             <el-button :icon="isQuerying?'loading':'search'" type="primary" @click="onSubmit">
               查询
             </el-button>
          </el-col>
        </el-row>
      </el-collapse-item>

      <transition  name="fade" mode="out-in" appear>
        <el-row v-if="formParams.length > 0" style="padding:10px">
          <el-col :span="2"><span style="font-size: 12px; line-height: 23px;"><i class="el-icon-menu" style="color:#20A0FF;" /> 已选条件:</span></el-col>
          <el-col :span="20"><el-tag v-for="item in formParams" :key="item.key" :closable="true" @close="closeTag(item)" :type="item.type" >{{item.label}}</el-tag></el-col>
        </el-row>
      </transition>

    </el-collapse>

    <!-- 过滤条件 -->
    <el-collapse >
      <el-collapse-item title="实时过滤条件" name="1">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="图表类型">
            <el-select @change="changeChartData" v-model="chartDataType" placeholder="请选择">
              <el-option
                v-for="item in chartDataTypes"
                :label="item.name"
                :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-form>

      </el-collapse-item>
    </el-collapse >

    <!-- 图表 -->
    <el-card class="card" body-style="padding:10px" >
      <echart :options="chartOpts" :height="300" />
    </el-card>
    <!-- 表格 -->
    <el-card class="card" body-style="padding:0" >
      <!-- e-ui table -->
      <!-- <el-table style="border:none;" border height="300" :fit="false" :data="currentPageData" >
        <el-table-column fixed property="name" width="100" label="链路名称" />
        <el-table-column v-for="col in legends"
          show-overflow-tooltip :sortable="true"
          :default-sort = "{prop: 'date', order: 'descending'}"
          :property="col.key+'Vv'"
          :label="col.name+'('+col.unit+')'" />
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length" /> -->
      <!-- native table -->
      <!-- <table>
        <tr>
          <th v-for="col in legends">{{col.name + '('+col.unit+')'}}</th>
        </tr>
        <tr v-for="row in tableData">
          <td v-for="col in legends">{{row[col.key]}}</td>
        </tr>
      </table> -->
      <!-- hhgrid -->
      <grid :options="{height: 300,table:{loadMode:'local_page_load'}}" :cols="cols" :data="tableData" />

    </el-card>

  </div>
</template>

<script>
import Vue from 'vue'
import Element from 'element-ui'
import {getLinkData} from 'src/service/getData'
import barOpt from 'src/components/echart/tpl/barOpt.js'
import echart from 'src/components/echart/index'
import grid from 'src/components/hhgrid/index'
import './index.less'

Vue.use(Element)

export default {
  name: 'anaPage',
  data: function (){
    let legends = [
      {name:'上行流量',unit:'MB',key:'upByte',dataGrp:'1'},
      {name:'下行流量',unit:'MB',key:'dnByte',dataGrp:'1'},
      {name:'双向流量',unit:'MB',key:'totalByte',dataGrp:'1'},
      {name:'上行通过流量',unit:'MB',key:'upPassByte',dataGrp:'2'},
      {name:'下行通过流量',unit:'MB',key:'dnPassByte',dataGrp:'2'},
      {name:'上行丢弃流量',unit:'MB',key:'upDisByte',dataGrp:'3'},
      {name:'下行丢弃流量',unit:'MB',key:'dnDisByte',dataGrp:'3'},
      {name:'上行速率',unit:'MBps',key:'upBps',dataGrp:'4'},
      {name:'下行速率',unit:'MBps',key:'dnBps',dataGrp:'4'},
      {name:'双向速率',unit:'MBps',key:'totalBps',dataGrp:'4'},
      {name:'上行最大速率',unit:'MBps',key:'upMaxBps',dataGrp:'5'},
      {name:'下行最大速率',unit:'MBps',key:'dnMaxBps',dataGrp:'5'},
      {name:'双向最大速率',unit:'MBps',key:'totalMaxBps',dataGrp:'5'},
      {name:'上行通过速率',unit:'MBps',key:'upPassBps',dataGrp:'6'},
      {name:'下行通过速率',unit:'MBps',key:'dnPassBps',dataGrp:'6'},
      {name:'上行丢弃速率',unit:'MBps',key:'upDisBps',dataGrp:'7'},
      {name:'下行丢弃速率',unit:'MBps',key:'dnDisBps',dataGrp:'7'},
    ]
    return {
      form: {
        linkName: {
          label: "链路",
          name: "linkName",
          val: "",
          defaultVal: ""
        }
      },
      isQuerying: false,
      formParams: [],
      chartOpts: { legend: {}, xAxis: {}, yAxis: {}, series: []},
      tableData: [],
      pageSizes: [10,50,100],
      pageSize: 10,
      currentPage: 1,
      currentPageData:[],
      chartDataType: "1",
      chartDataTypes: [
        {name: "流量",value: "1",keys: ['upByte','dnByte','totalByte']},
        {name: "通过流量",value: "2",keys: ['upPassByte','dnPassByte']},
        {name: "丢弃流量",value: "3",keys: ['upDisByte','dnDisByte']},
        {name: "速率",value: "4",keys: ['upBps','dnBps','totalBps']},
        {name: "最大速率",value: "5",keys: ['upMaxBps','dnMaxBps','totalMaxBps']},
        {name: "通过速率",value: "6",keys: ['upPassBps','dnPassBps','totalPassBps']},
        {name: "丢弃速率",value: "7",keys: ['upDisBps','dnDisBps','totalDisBps']}
      ],
      legends: legends,
      cols:(function () {
        return [{
          text: "链路名称", name: 'name',fixed: true,dragable: true,width: 120
        }].concat(_.map(legends,function (l) {
          return {text: l.name,name: l.key,dragable: true,sortable: true,width: 150}
        }))
      })(),
    }
  },
  components: {
    echart,grid
  },
  watch: {
    currentPage: function (val,oldVal) {
      this.getCurrData()
    },
    tableData: function (val,oldVal) {
      this.getCurrData();
      this.upDateChart();
    },
    pageSize: function (val,oldVal) {
      this.getCurrData()
    },

  },
  methods: {
    upDateChart: function () {
      let data = this.tableData;
      let legends = this.legends;
      let currChartDataType = _.find(this.chartDataTypes,{value: this.chartDataType});

      let cLengend = []
      let cSeries = []
      let getSeriesData = this.getSeriesData;

      legends = _.filter(legends,{dataGrp:currChartDataType.value})

      legends.map(function (l) {
        cLengend.push(l.name);
        cSeries.push({
          name: l.name,
          type: 'bar',
          data: getSeriesData(data,l.key)
        })
      })
      let chartOpts = {
        tooltip: {
          trigger:'axis'
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                endValue:6,
                xAxisIndex: [0],
            },
            {
                type: 'inside',
                endValue:6,
                xAxisIndex: [0],
            }

        ],
        yAxis: {
          name: currChartDataType.name,
          axisLabel: {
            formatter:function(val,i){
              var p = Math.floor(Math.log(val)/Math.LN10)//次方
              if(p > 0){
               return Math.ceil(val * Math.pow(10,-p)) + "e"+ p
              }
              else{
               return val;
              }
            },
          }
        },
        xAxis:{
          name: '链路',
          data: _.map(data,'name'),
          axisLabel:{
            interval: 0
          }
        },
        legend: {
          data:cLengend
        },
        series: cSeries
      }

      // this.chartOpts = chartOpts
      this.chartOpts = Object.assign(barOpt,chartOpts)
    },
    getSeriesData: function (data,key) {
      return _.map(data,key);
    },
    changeChartData: function (val) {
      this.upDateChart();
    },
    addFormParams: function () {
      let form = this.form;
      let list = [];
      _.forEach(form,function (item,key) {
        list.push({
          key,
          label: item.label + " : " + item.val
        })
      })
      this.formParams = list
    },
    getCurrData: function () {
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      this.currentPageData = this.tableData.slice(start,end)
    },
    getData: async function () {
      let res = await getLinkData();
      this.tableData = res.default.list;
    },
    onSubmit: function () {
      this.addFormParams();
      this.getData();
    },
    handleEdit: function () {
      console.log(arguments);
    },
    handleSizeChange: function (pageSize) {
      this.pageSize = pageSize
    },
    handleCurrentChange: function (currentPage) {
      this.currentPage = currentPage
    },
    closeTag: function (tag) {
      this.formParams = this.formParams.filter(item => item.key !== tag.key);
    }
  },
  mounted : function () {
    this.getData();
  }
}
</script>
