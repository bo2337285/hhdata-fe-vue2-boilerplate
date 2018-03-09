<template>
  <div>
    <!-- 查询条件 -->
    <el-card body-style="padding:0;" style="border:none;" >
      <el-collapse value="1">
        <el-collapse-item title="查询条件" name="1">
          <el-row>
            <el-col :span="22" >
              <el-form :inline="true" :model="form" class="demo-form-inline">

                <el-form-item :label="form.time.label">
                  <el-date-picker
                    v-model="form.time.val"
                    type="datetime"
                    placeholder="选择日期时间"
                    align="right"
                    :picker-options="datetimeOpt">
                  </el-date-picker>
                </el-form-item>

                <el-form-item :label="form.operator.label">
                  <el-input v-model="form.operator.val" placeholder="请输入内容">
                </el-form-item>

              </el-form>
            </el-col>
            <el-col :span="2">
               <el-button :icon="isQuerying?'loading':'search'" type="primary" @click="onSubmit"> 查询 </el-button>
            </el-col>
          </el-row>
        </el-collapse-item>
        <formParams :data="form" :onClose="closeTag" />
      </el-collapse>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="card" body-style="padding:0;" >
      <div class="clearfix">
        <el-button-group style="float:right;">
          <el-button type="primary" icon="plus" @click="handleAdd"></el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 表格 -->
    <el-card class="card" body-style="padding:0;" >
      <grid :data="tableData" :cols="cols" :onSelection="onSelection" >
        <el-table-column slot="operator" align="center" fixed="right" label="操作" width="100">
          <template scope="scope">
            <el-button type="text" size="large" @click="handleEdit(scope)">
              <i class="fa fa-edit font-primary" aria-hidden="true"></i>
            </el-button>
            <el-button type="text" size="large" @click="handleDel(scope)">
              <i class="fa fa-trash font-danger" aria-hidden="true"></i>
            </el-button>
          </template>
        </el-table-column>
      </grid>
    </el-card>

    <!-- 对话框 -->
    <el-dialog  ref="dialog"
      :title="dialog.title"
      :modal-append-to-body="false"
      v-model="showDialog">
      <component ref="comp" :is="dialog.route"
        @cancle="dialogCancle" @submit="dialogSubmit" />
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import Element from 'element-ui'
import {getOLogs} from 'src/service/getData'
import grid from 'src/components/egrid/index'
import formParams from 'src/components/formParams/index'
import moduleAdd from './add'
import {datetimeOpt} from 'src/assets/js/pickerOpt'
import './index.less'

Vue.use(Element);

let operaColFmt = function () {
  let $btn = $("<i class='fa fa-trash'>")
  return $btn;
}

export default {
  data: function (){
    return {
      datetimeOpt : datetimeOpt,
      form: {
        time: {
          label: "操作时间",
          name: "time",
          val: "",
          defaultVal: ""
        },
        operator: {
          label: "操作员名称",
          name: "operator",
          val: "",
          defaultVal: "aaaa"
        },
      },
      dialog:{
        title:"",
        route:""
      },
      isQuerying: false,
      showDialog: false,
      tableData: [],
      cols:[
        {text: "操作时间", name: 'time',fixed: true,dragable: true,width: 120, sortable: true},
        {text: "操作员名称", name: 'operator',fixed: false,dragable: true,width: 160},
        {text: "操作IP地址", name: 'ipAddr',fixed: false,dragable: true,width: 160},
        {text: "功能名称", name: 'func',fixed: false,dragable: true,width: 120},
        {text: "类名称", name: 'className',fixed: false,dragable: true,width: 120},
        {text: "方法名称", name: 'methodName',fixed: false,dragable: true,width: 120},
        {text: "请求", name: 'url',fixed: false,dragable: true,width: 120},
        {text: "操作类型", name: 'type',fixed: false,dragable: true,width: 120},
        {text: "操作描述", name: 'info',fixed: false,dragable: true,width: 120},
        {text: "操作结果", name: 'result',fixed: false,dragable: true,width: 120},
        {text: "管理域", name: 'domain.name',fixed: false,dragable: true,width: 120},
      ],
    }
  },
  components: { grid, formParams, moduleAdd, },
  methods: {
    getData: async function () {
      let res = await getOLogs();
      // console.log(res);
      this.tableData = res? res.data : [];
    },
    onSubmit: function () {
      this.getData();
    },
    closeTag: function (tag) {
      if(!!this.form[tag.key]){//重置
        this.form[tag.key].val = "";
      }
    },
    onSelection: function () {
      console.log(arguments);
    },
    dialogCancle: function () {
      this.showDialog = false;
    },
    dialogSubmit: function () {
      this.showDialog = false;
      this.getData();
    },
    handleAdd: function () {
      this.dialog.title="添加"
      this.dialog.route="moduleAdd"
      this.showDialog = true;
    },
    handleEdit: function (scope) {
      console.log(scope.row);
    },
    handleDel: function (scope) {
      console.log(scope.row);
    },
  },
  mounted : function () {
    this.onSubmit();
  },
  watch : {
    showDialog : function (val) {
      if (!val) {
        this.dialog = {
          title:"",
          route:""
        }
      }
    }
  }
}
</script>
