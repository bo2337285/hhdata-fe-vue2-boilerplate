/**
 * 自动根据src/page目录结构生成pages.js，作为vue的页面动态组件
 * @param  {[type]} 'path' [description]
 * @return {[type]}        [description]
 */
var path = require('path');
var glob = require('glob');
var fs = require('fs');

var files = glob.sync('src/page/**/index.vue')
var text = "";//最后要拼的js内容
var exportText = "";//拼export用
files.forEach(function(filepath) {
   var split = filepath.split('/');
   var name = split[split.length - 2];//模块名
   text += "const "+ name +" = r => require.ensure([], () => r(require('src/page/"+name+"/index.vue')), '"+name+"');\n"
   exportText += "\n  "+ name + ","
 });
 //拼最后export部分
 text += "\nexport default {"+exportText+"\n}"

fs.writeFile(path.join(__dirname,"../src/page/pages.js"),text,function (err) {
  if (err) throw err;
  console.log('写入功能模块列表完成');
})
