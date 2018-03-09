<template lang="html">
  <el-card id="loginDialog" class="box-card">
    <div slot="header" class="clearfix">
      <span style="line-height: 36px;">登录入口</span>
    </div>
    <div  class="">
      <el-form :model="form" labelPosition="top" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm" @keyup="(e)=>{console.log(e)}">

        <el-form-item prop="name">
          <el-input autofocus placeholder="用户名" v-model.number="form.name" >
            <el-button slot="append" ><i class="fa fa-user" aria-hidden="true"></i></el-button>
          </el-input>
        </el-form-item>

        <el-form-item prop="pwd">
          <el-input placeholder="密码" type="password" v-model="form.pwd" auto-complete="off">
            <el-button slot="append" ><i class="fa fa-lock" aria-hidden="true"></i></el-button>
          </el-input>
        </el-form-item>

        <el-form-item prop="rand">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-input  placeholder="验证码" v-model.number="form.rand" auto-complete="off">
                <el-button slot="append" ><i class="fa fa-image" aria-hidden="true"></i></el-button>
              </el-input>
            </el-col>
            <el-col :span="8">
              <img class="rand" :src="icodeSrc" @click="refreshIcode" alt="验证码"/>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item style="text-align:center;">
          <el-button style="width:100%;" type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import vUtil from 'src/assets/js/validatorUtil'
import {sendLogin,getRand} from 'src/service/getData';
import jquery from 'jquery';
import {baseUrl} from 'src/config/env'
window.$ = jquery;

export default {
  data() {
    return {
      form: {
        name: 'super',
        pwd: 'superadmin',
        rand: ''
      },
      icodeSrc: '',
      rules: {
        pwd: [ {required: true, message: '请输入密码', trigger: 'blur'} ],
        name: [ {required: true, message: '请输入用户名', trigger: 'blur'} ],
        rand: [
          { required: true, message: '请输入用户名验证码'},
          { type: "string", len: 4 ,message: '验证码必须为4位字符'}
        ],
      }
    }
  },
  created() {
    this.refreshIcode();
  },
  mounted() {
    let that = this;
    this.keyupFn = function(event) {
      if (event.keyCode == 13) {
        that.submitForm.call(that)
      }
    }
    document.addEventListener('keyup', this.keyupFn)
  },
  destroyed() {
    document.removeEventListener('keyup',this.keyupFn)
  },
  methods: {
    submitForm () {
      let that = this;
      this.$refs['form'].validate(async function (valid) {
        if (valid) {
          let res = await sendLogin(that.form);
          if (res.result > 1) {
             window.app.$message({
               showClose: true,
               message: "登录成功",
               duration: 1000,
               type: 'success'
             });
            // that.$router.replace('/index')
            that.$router.push('/index')
          }
        } else {
          return false;
        }
      });
    },
    refreshIcode: async function(){
      let res = await getRand();//获取base64
      if (!!res.result) {
        this.icodeSrc = "data:image/jpg;base64," + res.data;
      }
    }
  },
  components: {}
};
</script>

<style lang="css">
#loginDialog{ position: absolute; top:0;left: 0;right: 0;bottom: 0;margin: auto; width: 400px;height: 350px; }
.rand{ display: inline-block;width: 100%;height: 36px;cursor: pointer; }
@media screen and (max-width: 600px) {
  #loginDialog { width: auto; margin: auto 10px; }
}
</style>
