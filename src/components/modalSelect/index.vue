<template>
  <div class="modalSelect">
    <input @focus="onFocus" @click="toggleDialog" class="ms hhrms-source" v-model="input" :placeholder="placeholder" />
    <el-dialog :show-close="show_close" :close-on-click-modal="close_on_click_modal 	" :close-on-press-escape="close_on_press_escape" :modal-append-to-body="modal_append_to_body" title="提示" :visible.sync="dialogVisible" :size="size" :top="top">
      <div class="top">
        <el-input class="searchInput" v-model="searchInput" placeholder="请输入内容"></el-input>
        <el-button class="searchBtn" @click="onClearClick">清除已选结果</el-button>
      </div>
      <div :class="selectedItems.length > 0? 'panel' : 'panel panelNodata'">
        <el-button @click="onBtnLabelClick(item)" v-for="item in selectedItems" type="info" size="small">{{getBtnLabel(item)}}</el-button>
      </div>
      <div :class="breadItems.length > 0 ? 'bread':'bread breadAfter'">
        <span v-for="item in breadItems" @click="onBreadClick(item)" class="el-breadcrumb__item">
          <span class="el-breadcrumb__item__inner">{{item.label}}</span>
          <span class="el-breadcrumb__separator">/</span>
        </span>
      </div>
      <div class="list">
        <div class="listTitle">
          <table>
            <tbody>
              <tr>
                <td class="titleItem item-type">类别</td>
                <td class="titleItem item-name">
                  <span class="isCheckAll" v-if="isCheckAll">
                      <checkBox :indeterminate="checkall_indeterminate" :change="onCheckAllChange" :item="getCheckAllItem()" />
                  </span>
                  名称
                </td>
                <td class="titleItem item-path">路径</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="listContent">
          <table>
            <tbody>
              <tr v-for="item in showList">
                <td class="item-type">{{item.type}}</td>
                <td class="item-name">
                  <checkBox :change="onItemChange" :item="item" />
                  <span class="name-label">
                    <el-button v-if="!!item.hasChildNode" type="text"  @click="changeView(item)">{{item.label}}</el-button>
                    <span class="labelStyle" v-else>{{item.label}}</span>
                  </span>
                </td>
                <td class="item-path">{{item.path}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit">确 定</el-button>
        <el-button @click="onCancel">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import './index.less'
import _ from "lodash";
import checkBox from './checkBox/index.vue'



export default {
  props: ['options', 'onItemCheck'],
  data() {
    let data = {
      searchInput: "", //dialog顶部查询
      input: "", //模态选择框的点击/回显框
      placeholder: "", //回显框的placeholder
      dialogVisible: false, //dialog显示flag
      size: "small", //dialog尺寸
      top: "10%", //dialog距离顶部
      //panelClass: "panel", //
      modal_append_to_body: false, //true: dialog遮罩层在body上 false: 在父元素上
      close_on_click_modal: false, //是否可以通过点击 遮罩层 关闭 Dialog
      show_close: false, //是否显示右上角 close按钮
      close_on_press_escape: false, //是否可以通过按下 ESC 关闭 Dialog
      breadItems: [], //面包屑
      isCheckAll: true, //是否本页全选
      checkall_indeterminate: false, //全选框的非全选状态
    }
    if(!!this.onItemCheck){
      data.isCheckAll = false;
    }
    function Item(opt, opts, disabledItems, defaultValue) {
      let keyMap = opts.keyMap, type = opts["type"];
      this.id = opt[keyMap.id];
      this.type = opt[keyMap.type];
      this.pid = opt[keyMap.pid];
      this.label = opt[keyMap.label];
      this.option = opt;

      let _id = this.type + "_" + this.id,
          _pid = this.pid ? type[type.indexOf(this.type) - 1] + "_" + this.pid : "";
      this._id = _id;
      this._pid = _pid;
      let path = "\\", pid = this.pid, objs = opts.list;
      while(!!pid){
        let temp = {};
        temp[keyMap.id] = pid;
        var p = _.filter(objs, temp)[0];
        p.hasChildNode = true;
        path = "\\" + p[keyMap.label] + path;
        pid = p[keyMap.pid];
      }
      this.hasChildNode = false;
      this.path = path;
      this.checked = false;
      this.disabled = false;
      if(disabledItems.indexOf(_id) > -1){
        this.disabled = true;
      }
      if(!!defaultValue[this.type] && defaultValue[this.type].indexOf(this.id) > -1){
        this.checked = true;
      }
    }

    Item.prototype={
      init: function(_parent, _children){
        this._parent = _parent;
        this._children = _children;
      },
      _parent: null,
      _children: null,
      getParent: function () {
        return this._parent;
      },
      getSiblings: function () {
        return this._parent;
      }
    }

    let options = _.clone(this.options);
    let disabledItems = options.disabledItems || [];
    let defaultValue = options.defaultValue || {};
    let placeholder = options.placeholder || "请选择";
    data.placeholder = placeholder;
    function setDefaultList(options, disabledItems, defaultValue){
      let list = options.list||[], res = [], keyMap = options.keyMap, objs = options.list;
      list.forEach(function (opt,i) {
        res.push(new Item(opt, options, disabledItems, defaultValue));
      });
      res.forEach(function(o, i){
        let temp = {}, obj;
        temp[keyMap.id] = o.id, temp[keyMap.type] = o.type;
        obj = _.filter(objs, temp)[0];
        o.hasChildNode = !!obj ? obj.hasChildNode || false : false;
      })
      return res;
    }

    data.list = setDefaultList(options, disabledItems, defaultValue);
    data.showList = this.getDefaultShowList(data.list);
    data.prevList = data.showList;
    data.selectedItems = this.getDefaultSelectedItems(defaultValue);

    let inputValue = "";
    if(JSON.stringify(defaultValue) != "{}"){
      for(var i in defaultValue){
        let arrValues = defaultValue[i].split(",");
        arrValues.forEach(function(o){
          if(!!inputValue)inputValue += ",";
          inputValue += _.filter(data.list, { type: i, id: o})[0].label;
        });
      }
    }
    data.input = inputValue;
    //转换为字符串, 不转则会在第二次执行赋值操作时与$this中指向对象 为同一个
    data.temp_data = JSON.stringify(data);

    return data;
  },

  watch: {
    searchInput: {
      handler: function (val,oldVal) {
        // 输入时
        if(val != ""){
          this.getShowList(val);
        }else{
          this.showList = this.prevList;
        }
      },
    },
    temp_data:{
      handler: function (val,oldVal) {
        //
      },
      deep: true,
    }
  },
  methods: {
    Item(option){
       //this
    },
    getDefaultSelectedItems: function(dv){
      let res = [];
      for(var i in dv){
        dv[i].split(",").forEach(function(o, j, objs){
          res.push(i + "_" + o);
        });
      }
      return res;
    },
    onFocus: function(e){
      e.target.blur();
    },
    toggleDialog: function(){
      this.dialogVisible = !this.dialogVisible;
    },
    getDefaultShowList(list) {
      let res = [];
      list.forEach(function(o, i){
        if(!!!o.pid){
          res.push(o);
        }
      });
      return res;
    },
    setList(list){
      list.map(function(o){
        for(var i in o){
          if(!!!o[i] || o[i]+"" == "null"){
            o[i] = "";
          }
        }
        return o;
      });
      return list;
    },
    onCancel() {
      this.setData(this, JSON.parse(this.temp_data))
      this.dialogVisible = false;
    },
    onSubmit() {
      this.setInputValue();
      this.setData(JSON.parse(this.temp_data), this, true);
      this.dialogVisible = false;
    },
    setData(data1, data2, isSubmit){
      for( var i in data2 ){
        if(data1[i] !== undefined){
          data1[i] = data2[i];
        }
      }
      if(isSubmit){
        this.temp_data = JSON.stringify(data1);
      }
    },
    setInputValue(){
      let text = "", res;
      res = _.filter(this.list,{checked: true}).forEach(function(o, i){
        if(!!text){ text += "," };
        text += o.label
      });
      this.input = text;
    },
    getShowList(val){
      let res = [];
      this.list.map(function(o, i){
        if(o.label.toLowerCase().indexOf(val.toLowerCase()) > -1){
          res.push(o);
        }
      });
      this.showList = res;
    },
    onCheckboxChange(e, o){
      let _id = o._id;
      if(e.target.checked){
        this.selectedItems.push(_id);
      }else {
        this.selectedItems.splice(this.selectedItems.indexOf(_id), 1);
      }
    },
    changeView(item){
      let i = 0,type = this.options.type;
      type.forEach(function(o, j){
        if(o === item.type){
          i = j+1;
        }
      })
      this.showList = _.filter(this.list, {type: type[i], pid: item.id});
      this.prevList = this.showList;
      this.setCurrBreadByItem(item, i-1);
    },
    setCurrBreadByItem(item, i, isNotAppendSelf){
      let breadItems = [],type = this.options.type;
      var pid = item.pid;
      while(pid){
        var p = _.filter(this.list, {id: pid, type: type[i-1]})[0];
        breadItems.unshift(p);
        pid = p.pid;
        i = i-1;
      }
      if(!!!isNotAppendSelf){
        breadItems.push(item);
      }
      this.breadItems = breadItems;
    },
    onBreadClick(item){
      let index = this.options.type.indexOf(item.type);
      if(!!item.pid && index > -1){
        this.showList = _.filter(this.list, {pid: item.pid, type: this.options.type[index]});
      }else{
        this.showList = this.getDefaultShowList(this.list);
      }
      this.prevList = this.showList;
      this.setCurrBreadByItem(item, index, true);
    },
    getBtnLabel(_id){
      let item = _.filter(this.list, {_id: _id})[0],
      label = !!item ? item.label : "";
      return label;
    },
    onBtnLabelClick(_id){
      this.selectedItems.splice(this.selectedItems.indexOf(_id), 1);
      _.filter(this.list, {_id: _id})[0].checked = false;
    },
    onClearClick(){
      this.selectedItems = [];
    },
    onItemChange(item, flag){
      //item的checked已经在checkbox中处理了
      if(flag){
        this.selectedItems.push(item._id);
      }else{
        this.selectedItems.splice(this.selectedItems.indexOf(item._id), 1);
      }
    },
    onCheckAllChange(item, flag){
      let _this = this;
      this.showList.forEach(function(o){
        if(!o.disabled){
          if(!o.checked && flag){
            _this.selectedItems.push(o._id);
          }else if(!flag && o.checked){
            _this.selectedItems.splice(_this.selectedItems.indexOf(o._id), 1);
          }
          o.checked = flag;
        }
      });
      this.checkall_indeterminate = false;
    },
    getCheckAllItem(){
      let res = {
        checked: false,
      }, isCheckAll = true, isHasChecked = false, flag = false;
      this.showList.forEach(function(o, i){
          if(!o.disabled){
            if(o.checked){
              isHasChecked = true;
            }else{
              isCheckAll = false;
            }
          }
      });
      if(isHasChecked){
        flag = true;
      }
      if(isCheckAll){
        flag = false;
        res.checked = true;
      }
      this.checkall_indeterminate = flag;
      return res;
    },
		transformTozTreeFormat: function(setting, sNodes) {
			var i,l,
			key = "_id",
			parentKey = "_pid",
			childKey = "_children";
			if (!key || key=="" || !sNodes) return [];

			if (tools.isArray(sNodes)) {
				var r = [];
				var tmpMap = [];
				for (i=0, l=sNodes.length; i<l; i++) {
					tmpMap[sNodes[i][key]] = sNodes[i];
				}
				for (i=0, l=sNodes.length; i<l; i++) {
					if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
						if (!tmpMap[sNodes[i][parentKey]][childKey])
							tmpMap[sNodes[i][parentKey]][childKey] = [];
						tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
					} else {
						r.push(sNodes[i]);
					}
				}
				return r;
			}else {
				return [sNodes];
			}
		},
  },
  mounted : function () {
    //
  },
  components: {checkBox},
}
</script>
