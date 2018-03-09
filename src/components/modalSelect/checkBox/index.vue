<template>
  <label class="hh-checkbox">
    <span :class="className">
      <span @click="onClick" class="hh-checkbox__inner"></span>
      <input type="checkbox" disabled="disabled" class="hh-checkbox__original" :value="label">
    </span>
    <span class="hh-checkbox__label">{{label}}</span>
  </label>
</template>

<script>
import './index.less'
import _ from "lodash";

export default {
  props: ["item", "change", "indeterminate"],
  data() {
    let data = {
      className: "hh-checkbox__input"
    }
    if(this.indeterminate){
      data.className += " is-indeterminate";
    }
    if(this.item.checked){
      data.className += " is-checked";
    }
    if(this.item.disabled){
      data.className += " is-disabled";
    }
    return data;
  },
  watch: {
    indeterminate:{
      handler: function (val,oldVal) {
        if(val){
          this.className += " is-indeterminate";
        }else {
          this.className.replace(" is-indeterminate", "");
        }
      }
    },
    item: {
      handler: function (val,oldVal) {
        let str = "hh-checkbox__input";
        if(this.indeterminate){
          str += " is-indeterminate";
        }
        if(val.checked){
          str += " is-checked";
        }
        if(val.disabled){
          str += " is-disabled";
        }
        this.className = str;
      },
      deep: true,
    },
  },
  methods: {
    onClick(){
      if(!this.item.disabled){
        this.item.checked = !this.item.checked;
        this.change(this.item, this.item.checked);
      }
      if(this.item.checked){
        this.className += " is-checked";
      }else{
        this.className = this.className.replace(" is-checked", "");
      }
    }
  },
  mounted : function () {
    // debugger
  }
}
</script>
