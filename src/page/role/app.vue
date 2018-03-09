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


    <!-- 表格 -->
    <el-card class="card" body-style="padding:0" >
      <grid :options="{height: 300,table:{loadMode:'local_page_load'}}" :cols="cols" :data="tableData" />

    </el-card>

  </div>
</template>

<script>
import Vue from 'vue'
import Element from 'element-ui'
import {getRoleData} from 'src/service/getData'
import barOpt from 'src/components/echart/tpl/barOpt.js'
import grid from 'src/components/hhgrid/index'
import './index.less'

Vue.use(Element)

export default {
  data: function (){
    return {
      form: {
        linkName: {
          label: "角色名称",
          name: "name",
          val: "",
          defaultVal: ""
        }
      },
      isQuerying: false,
      formParams: [],
      tableData: [],
      pageSizes: [10,50,100],
      pageSize: 10,
      currentPage: 1,
      currentPageData:[],
      cols:(function () {
        return [
          {text: "操作时间", name: 'time',fixed: true,dragable: true,width: 120},
          {text: "操作员名称", name: 'pmsType',fixed: false,dragable: true,width: 120},
          {text: "操作IP地址", name: 'ipAddr',fixed: false,dragable: true,width: 120},
          {text: "功能名称", name: 'func',fixed: false,dragable: true,width: 120},
          {text: "类名称", name: 'className',fixed: false,dragable: true,width: 120},
          {text: "方法名称", name: 'methodName',fixed: false,dragable: true,width: 120},
          {text: "请求", name: 'url',fixed: false,dragable: true,width: 120},
          {text: "操作类型", name: 'type',fixed: false,dragable: true,width: 120},
          {text: "操作描述", name: 'info',fixed: false,dragable: true,width: 120},
          {text: "操作结果", name: 'result',fixed: false,dragable: true,width: 120},
          {text: "管理域", name: 'domain',fixed: false,dragable: true,width: 120},
        ]
      })(),
    }
  },
  components: {
    grid
  },
  watch: {
    currentPage: function (val,oldVal) {
      this.getCurrData()
    },
    tableData: function (val,oldVal) {
      this.getCurrData();
      // this.upDateChart();
    },
    pageSize: function (val,oldVal) {
      this.getCurrData()
    },

  },
  methods: {
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
      let res = await getRoleData();
      // console.log(res);
      this.tableData = res? res.data : [];
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
