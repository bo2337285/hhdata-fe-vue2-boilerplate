<template lang="html">
  <transition  name="fade" mode="out-in" appear>
    <el-row v-if="formParams.length > 0" style="padding:10px">
      <el-col :span="2"><span style="font-size: 12px; line-height: 23px;"><i class="el-icon-menu" style="color:#20A0FF;" /> 已选条件:</span></el-col>
      <el-col :span="22"><el-tag v-for="item in formParams" :key="item.key" :closable="true" @close="closeTag(item)" :type="item.type" >{{item.label}}</el-tag></el-col>
    </el-row>
  </transition>
</template>

<script>
import moment from 'moment';
export default {
  props: ['data','onClose'],
  data() {
    return {
      formParams : []
    };
  },
  watch: {
    data :{
      handler: function () {
        let that = this;
        let form = this.data;
        let list = [];
        _.forEach(form,function (item,key) {
          if (!!item.val || item == 0) {
            list.push({
              key,
              label: item.label + " : " + that.fmtVal(item.val)
            })
          }
        })
        this.formParams = list
      },
      deep: true
    }
  },
  methods: {
    closeTag : function (tag) {
      this.onClose.apply(this,[tag])
    },
    fmtVal : function (value) {
      var that = this;
      if (value instanceof Date) {
        return moment(value).format("YYYY-MM-DD HH:mm:ss");
      }else if (value instanceof Array) {
        return _(value).map(function (item) {
          return that.fmtVal(item);
        }).join(',');
      }else{
        return value;
      }
    }
  }
};
</script>

<style lang="css">
</style>
