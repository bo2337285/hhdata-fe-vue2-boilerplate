<template>
    <div class="activePublic ">
      <el-steps :space="200" :active="currStep" class="step">
        <el-step title="活动信息" description=""></el-step>
        <el-step title="报名签到" description=""></el-step>
        <el-step title="分享设置" description=""></el-step>
        <el-step title="个性设置" description=""></el-step>
      </el-steps>

      <transition name="fade">
        <component :is="'step'+currStep" />
      </transition>

        <div class="but-group">
          <el-button @click.native.prevent="handlePreview" v-show="preview">预览</el-button>
          <el-button @click.native.prevent="handlePreStep" v-show="currStep > 1 && currStep <= 4">上一步</el-button>
          <el-button @click.native.prevent="handleNextStep" v-show="currStep => 1 && currStep < 4" type="primary">下一步</el-button>
          <el-button @click.native.prevent="handlePublish" v-show="publish" type="primary">发布活动</el-button>
        </div>
    </div>
</template>

  <script>
    import $ from 'jquery'
    // import VueRouter from 'vue-router'

    const step1 = r => require.ensure([], () => r(require('./step1.vue')), 'step1')
    const step2 = r => require.ensure([], () => r(require('./step2.vue')), 'step2')
    const step3 = r => require.ensure([], () => r(require('./step3.vue')), 'step3')
    const step4 = r => require.ensure([], () => r(require('./step4.vue')), 'step4')

    export default {
    name:'activePublic',
    data: function () {
      return {
        currStep: 1,
        preview: true,
        publish: false
      }
    },
    methods: {
      handlePreview: function () {
        console.log('预览');
      },
      handlePreStep: function () {
          if (this.currStep > 1) {
            this.currStep--
          }
      },
      handleNextStep: function () {
          if (this.currStep < 4 ) {
            this.currStep++
          }
      },
      handlePublish: function () {
        console.log('发布');
      },
      goStep: function (n) {
        this.currStep = n;
      }
    },
    components: {
        step1, step2, step3, step4
    }
  }

</script>
<style>
 .activePublic .router-link{color:#fff;}
 .activePublic .but-group .el-button{margin-right: 20px;}
</style>
