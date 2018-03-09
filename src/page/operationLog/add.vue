<template lang="html">
  <div class="">
    <el-form :inline="true" ref="form" :rules="rules" :model="form" class="demo-form-inline">

      <el-form-item  prop="operator.val" :label="form.operator.label">
        <el-input v-model="form.operator.val" placeholder="请输入内容">
      </el-form-item>

    </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:right;">
        <el-button @click="handleCancle">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
  </div>
</template>

<script>
import {addoLog} from 'src/service/getData';
import { Message } from 'element-ui';
let form = {
  operator: {
    label: "操作员名称",
    name: "operator",
    val: "",
    defaultVal: "aaaa"
  },
}
export default {
  props: ['onCancle','onSubmit'],
  data() {
    return {
      form: _.cloneDeep(form),
      rules: {
        'operator.val': [
          {required: true, message: '请输入操作员', trigger: 'blur'},
          { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  mounted: function () {
    this.init();
  },
  methods: {
    init: function () {
      this.form = _.cloneDeep(form);
    },
    handleCancle: function () {
      this.$emit('cancle');
      // this.onCancle();
    },
    handleSubmit: function () {
      let that = this;
      let postData = that.form;
      this.$refs['form'].validate(async function (valid) {
        if (valid) {
          let res = await addoLog(postData);
          if (res.result > 1) {
            Message({
              message: res.message,
              type: 'success'
            });
            that.$emit('submit',res);
            // that.onSubmit(res);
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="css">
</style>
