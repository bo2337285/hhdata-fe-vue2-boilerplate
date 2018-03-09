/**
* @name jquery.hhdata.gridlist.js
* @author hbf
* @version 2.1.2
* @lastUpdate 2016-02-14
* @copyright hhdata
**/
import jQuery from 'jquery'

(function($){
	var setting = { //默认设置，提取出来后，供外部调用控制
		width:"auto",
		height:"auto",
		maxHeight:"auto",
		title:null,
		enableNum : true,//是否开启序号列
		loadingTimeout:500, //最小等待遮罩显示时间ms
		cols:[],
		colFormatter : {},
		onComplete:function () {},//表格加载完成回调
		colOpera : false,
		colOperaClass : '',
		onColPromptShow : function (colList,fixedCols,dataCols) {},
		onColOperaSubmit : function (colList,fixedCols,dataCols) {},
		colOperaInfo : null,//为特殊需求添加的接口，支持添加icon于colOperaPrompt的按钮组旁
		gridQuery : false,
		gridQueryClass : '',
		onGridQuery : null, //function (keyword,rows) {return rows},
		table:{
			fullMode:false,//是否置满页面（让页面不出现滚动条）
			url:'',//加载数据请求的url
			queryParams:{},//加载数据请求url所跟的条件参数
			data:[],//初始化的数据
			loadMode:"local_load",//加载数据场景
			dataKey:"list",//加载数据对应在对象里的键
			onRowClick:function(rows,rowData){},
			onRowEnter:function(rows,rowData){},
			onRowLeave:function(rows,rowData){},
			checkbox:false,
			checkboxName:"",
			onChecked:function($rowArgs,$td,rowData,checked){},//当点击复选框
			onCheckedAll:function(checked){},//当全选
			onLoadData:function(){},//当开始更新数据时
			onLoadDataFinish:function(res){},//ajax数据加载完成回调
			onLoadDataSessionout:function(res){},//ajax数据加载session超时回调
			onLoadDataError:function(res){},//ajax数据加载错误回调
			onRenderDataFinish:function(){},//数据加载完成回调（包括ajax）
			operaCol:{},//{ operaColKey: function($rowArgs,$td,rowData,idx){} } operaColKey为data-opera的值 其对应的是操作列的格式化函数
		},
		extTable:{
			data:[],//汇总行数据
			dataKey:"extList",//汇总行对应在返回数据里的key
			onRowClick:function(rows,rowData){}
		},
		fixedTable:{
			fixedColName:[],
			postFixedColName:[]
		},
		page:{
			sizeFresh:0,//记录每次删除的个数变化
			dataKey:"pagination",
			pageNumber:1,//当前分页索引
			pageSize:20,//当前分页显示条数
			pageList:[20,50,100],//分页显示条数可选范围
			dataTotal:0//总数据条数
		}
	};
	$.fn.gridList = function(option){
		var $table = $(this);
		//对象是否存在
		if(!$table.length){
			 console.info("Can't find selectElement which selector is :"+$table.selector);
		 		return false;
		 }

		//已创建过实例的，就返回实例
		if($table.data()["grid"]){
			return $table.data()["grid"];
		}
		$table.hide();//先将源表格隐藏
		//合并参数
		var opts = $.extend(true,{},setting,option);

		// ------通用函数--------------------------------------------------------------------------------
		var strUtil = {
			firstP : '第一页',
			prevP : '上一页',
			nextP : '下一页',
			lastP : '最后一页',
			Num : '序号'
		}
		var utilFn = {
			"debounce":function(func, wait, immediate) {
         var timeout;
         return function() {
             var context = this, args = arguments;
             var later = function() {
                 timeout = null;
                 if (!immediate) func.apply(context, args);
             };
             var callNow = immediate && !timeout;
             clearTimeout(timeout);
             timeout = setTimeout(later, wait);
             if (callNow) func.apply(context, args);
         };
     	},
		 	"getDeepVal" : function (data,keys,def) {
				if (!!!keys && keys !== 0) {//keys不存在时，直接返回空字符串
					return "";
				}
				var keys =!!keys? keys.split(".") : "",out = data;
				try{
					[].forEach.call(keys,function(k) {
						if(/\[\d\]/.test(k)){//数组
							var idx = k.replace(/^.*\[(\d)\]/,"$1"),
									key = k.replace(/(^.*)\[\d\]/,"$1");
							out = !!key ? out[key][idx] : out[idx];
						}else{
							out = out[k];
						}
					})
				}catch(e){
					return  (!!def || def == 0) ? def : " ";
				}
				return  (!!out || out == 0) ? out : def;
			},
			"timer" : function (fn,args) {
				var t1 = new Date().getTime()
				fn.apply(grid,args);
				var t2 = new Date().getTime()
				console.log(t2-t1);
			}
		};
		// ------1.x版本遗留函数--------------------------------------------------------------------------------
		var _getRowData = function($rows){
			var _self = grid,
				key = $rows.data("key");
			return _self.sourceDataMap[key];
		};
		var _getColArgs = function(cell){
			var _self = grid,
				$td = $(cell),
				colIndex = $td.index(),
				$colArgs = $td.parents(".grid-table-wraper").find("tr").find("td:eq("+colIndex+")");
			return $colArgs;
		};

		var _goNextPage = function(){
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				pageNumber = parseInt($page.find(".page-number").val()),
				pageSize = $page.find(".page-list").val(),
				pageOpt = _self.page,
				nextPNumber = Math.min(++pageNumber,pageOpt.pageTotal);
			goPage(nextPNumber)
		};
		var _goPrevPage = function(){
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				pageNumber = parseInt($page.find(".page-number").val()),
				pageSize = $page.find(".page-list").val(),
				pageOpt = _self.page,
				prevPNumber = Math.max(--pageNumber,1);
			goPage(prevPNumber)
		};
		var _goFirstPage = function(){
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				pageNumber = parseInt($page.find(".page-number").val()),
				pageSize = $page.find(".page-list").val(),
				pageOpt = _self.page;
			goPage(1);
		};
		var _goLastPage = function(){
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				pageNumber = parseInt($page.find(".page-number").val()),
				pageSize = $page.find(".page-list").val(),
				pageOpt = _self.page;
			goPage(pageOpt.pageTotal);
		};
		var _initPageOpt = function(){
			var _self = grid,
				pageOpt = _self.page,
				dataTotal;
			if(getLoadMode().hasUrl){//has url?
				dataTotal =pageOpt.dataTotal;
			}else{
				dataTotal =_self.data.length;
			}
			pageOpt.pageTotal = Math.ceil(dataTotal / pageOpt.pageSize);
		}
		var _refreshPage = function(){
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				$pageNumber = $page.find(".page-number"),
				$pageTotal = $page.find(".page-total"),
				$dataTotal = $page.find(".page-data-total"),
				$pageList = $page.find(".page-list"),
				tempData = _self.data,
				dataTotal = tempData.length,
				pageOpt = _self.page;
			pageOpt.pageSize = parseInt($pageList.val());
			_initPageOpt();
			//每页显示条数
			$pageList.val(pageOpt.pageSize);
			//当前页
			if(pageOpt.pageTotal){
			    //若当前页为0而页面有数据，这使当前页变为第1页; edit by hbf 2015/7/2
			    if(_self.data.length && pageOpt.pageNumber == 0) {
			        pageOpt.pageNumber = 1
		        }
				pageOpt.pageNumber = Math.min(pageOpt.pageNumber,pageOpt.pageTotal);
			}
			$pageNumber.val(pageOpt.pageNumber);
			//总页数
			$pageTotal.text(pageOpt.pageTotal);
			//总数据
			$dataTotal.text(pageOpt.dataTotal);
		};
		var _urlLoadData = function(){
			var _self = grid,
				tableOpt = _self.opt.table,
				extTableOpt = _self.opt.extTable,
				key = tableOpt.dataKey,
				extKey = extTableOpt.dataKey,
				data = [];
			return $.ajax({
				url:tableOpt.url,
				type:'post',
				async:false,//must!
				data:tableOpt.queryParams,
				cache:true,
				error:function(){
					console.log("network error!");
				}
			}).done(function(res){
				 var flag = res["result"] || 0;
					switch(flag){
					case 1://数据正常返回
						//table
						data = eval("res."+key);
						_self.data = data;

						//回调
						_self.opt.table["onLoadDataFinish"](res);
						break;
					case 2://session超时
							_self.opt.table["onLoadDataSessionout"](res);
							break;
					case 0://数据返回失败
						_self.opt.table["onLoadDataError"](res);
						break;
					default:
							_self.opt.table["onLoadDataError"](res);
							break;
					}
			});
			// return data;
		};
		var _urlLoadDataPage = function(){
			var _self = grid,
				pageOpt = _self.page,
				tableOpt = _self.opt.table,
				extTableOpt = _self.opt.extTable,
				key = tableOpt.dataKey,
				pageKey = pageOpt.dataKey,
				extKey = extTableOpt.dataKey,
				postPageOpt,postOpt,
				data = [];

			/*防止传超出实际大小和0的页码*/
			var realPages=Math.ceil((pageOpt.dataTotal+_self.page.sizeFresh) / pageOpt.pageSize);
			if(pageOpt.pageNumber>realPages){
				pageOpt.pageNumber=Math.max(1,realPages);
				_self.page.sizeFresh=0;
			}
			if(typeof(tableOpt.queryParams) == "object"){
				postPageOpt ={currentPage:Math.max(1,pageOpt.pageNumber),pageSize:pageOpt.pageSize};
				postOpt = $.extend({},tableOpt.queryParams,postPageOpt);
			}else{
				postPageOpt ="currentPage="+Math.max(1,pageOpt.pageNumber)+"&pageSize="+pageOpt.pageSize;
				postOpt = tableOpt.queryParams+"&"+postPageOpt;
			}
			return $.ajax({
				url:tableOpt.url,
				type:'post',
				data:postOpt,
				cache:true,
				error:function(){
					console.log("network error!");
				}
			}).done(function(res){
					var flag = res["result"] || 0;
					switch(flag){
					case 1://数据正常返回
						var resOpt =res[pageKey];
						_self.page['dataTotal'] = resOpt.dataTotal;
						_self.data = resOpt[key]||[];
						if(!_self.data.length){
							 _self.page.pageNumber = 0;
						}else{
							//防止因出错导致页码为0 modified by hanhui
							if(_self.page.pageNumber == 0){
								_self.page.pageNumber=1;
							}
						}

						//回调
						tableOpt["onLoadDataFinish"](res);
						break;
					case 2://session超时
						tableOpt["onLoadDataSessionout"](res);
						break;
					case 0://数据返回失败
						tableOpt["onLoadDataError"](res);
						break;
					default:
						tableOpt["onLoadDataError"](res);
						break;
					}
				});
			// return data;
		};

		// -----主体逻辑函数---------------------------------------------------------------------------------

		var init = function (opts) {
			var _self = grid;
			_self.$element = renderWraper();
			// _self.gid = creatGId();

			if (opts.cols && opts.cols.length) {
				_self.header = createHeaderByColParams(opts.cols)
			}else{
				_self.header = creatHeaderByTable();
			}
			setColFormatter();
			// _self.$style = creatStyle();
			// _self.$cloneRow = creatCloneRow();
			_self.page = createPage();
			//设置表格title行
			setTitle(opts.title);
			_self.sourceDataMap = {};
			bindGridEvent();
			toggleColListVisible();
			autoCalColSize();
			loadData();
			_self.extRows = creatRow(_self.extData);
			renderExtData();
			colResize();
			gTrigger('g.reDraw');
		}
		var creatGId = function () {
			return Math.floor(Math.random()*new Date().getTime());
		}
		var creatStyle = function () {
			var $style = $("<style>").appendTo("body");
			$style.data("gid",grid.gid);
			return $style;
		}
		var creatCloneRow = function () {//todo 在输出的行中绑定col
			var _self = grid;
			// 复制表头作为行模板
			var $rowArgs = _self.$element.find("[class^=grid-head] table tr").clone().addClass('g-row');
			$rowArgs.find(".grid-td-div").empty();
			_self.$rowClone = $rowArgs;
			return $rowArgs;
		}
		var renderWraper = function(){
			var $grid = $("<div class='grid-list'>"+
								"<div class='grid-title'></div>"+//标题
								"<div class='grid-query'><span class='grid-query-inp-wraper'><input type='text' placeholder='请输入关键字' class='grid-query-inp'/><span class='grid-query-clear'></span></span></div>"+//表格内过滤
								"<div class='grid-body'>"+//正文
										"<div class='grid-fixed grid-table-wraper'>"+
												"<div class='grid-head-fixed'><table></table></div>"+
												"<div class='grid-body-fixed grid-looseEle'><table></table></div>"+
												"<div class='grid-ext-fixed'><table></table></div>"+
										"</div>"+
										"<div class='grid-data grid-table-wraper'>"+
												"<div class='grid-head-data'><table></table></div>"+
												"<div class='grid-body-data grid-looseEle'><div class='grid-table-wraper'><div class='grid-body-bg'></div><table></table></div></div>"+
												"<div class='grid-ext-data'><div class='grid-table-wraper'><div class='grid-body-bg'></div><table></table></div></div>"+
										"</div>"+
										"<div class='grid-post-fixed grid-table-wraper'>"+
												"<div class='grid-head-post-fixed'><table></table></div>"+
												"<div class='grid-body-post-fixed grid-looseEle'><table></table></div>"+
												"<div class='grid-ext-post-fixed'><table></table></div>"+
										"</div>"+
								"</div>"+

								"<div class='grid-page'></div>"+//分页
								"<div class='grid-col-prompt'><div class='grid-col-prompt-header'><input type='checkbox' class='grid-col-prompt-chk-all' /><label class='grid-col-prompt-label'>全选</label></div><div class='grid-col-prompt-content'></div><div class='grid-col-prompt-btns'><span class='grid-col-prompt-btn grid-col-prompt-submit'>保存</span><span class='grid-col-prompt-btn grid-col-prompt-keep'>暂存</span><span class='grid-col-prompt-btn grid-col-prompt-cancel'>取消</span></div></div>"+//呈现列列表
							"</div>").insertAfter($table);
			//列操作框的上下移箭头
			var $promptHeader = $grid.find('.grid-col-prompt-header'),
					$up = $("<span>").addClass('grid-col-prompt-move-up').appendTo($promptHeader),
					$down = $("<span>").addClass('grid-col-prompt-move-down').appendTo($promptHeader);
			if(opts.colOperaInfo){//如果存在蛋疼的外嵌icon,则硬塞
				$grid.find('.grid-col-prompt-btns').prepend(opts.colOperaInfo);
			}
			$table.appendTo($grid);//扔进grid就可以不管了
			return $grid;
		};
		var renderHead = function (header) {
			var _self = grid,
				$grid = _self.$element,
				colMap = header.colMap;

			var wrapTd = function (col) {
				var $td = col.dom,
						child = $td[0].childNodes,
						$div = $("<div>").addClass("grid-td-div");
				$(child).appendTo($div);
				$div.appendTo($td)
				if (!!!col.isChk) {
					$div.css("width",$td.data("width") || $td.width() || 50);//todo 序号列的宽度控制
				}else {
					$div.css("width",'33px').addClass('grid-chk-div');//复选框列的宽度控制
				}
				if(col.sortable){
					$div.addClass('sortable').attr("data-sortable","");
				}
			}

			var $fixedHeaderTable = $grid.find(".grid-head-fixed table").empty();
			var $postFixedHeaderTable = $grid.find(".grid-head-post-fixed table").empty();
			var $dataHeaderTable = $grid.find(".grid-head-data table").empty();
			//固定列
			var $fixedTr = $("<tr data-role='fixed'>").appendTo($fixedHeaderTable);
			var $postFixedTr = $("<tr data-role='postfixed'>").appendTo($postFixedHeaderTable);
			var $dataTr = $("<tr data-role='data'>").appendTo($dataHeaderTable);

			if (opts.table.checkbox) {//复选框列
				var col = header.colMap.chkCol;
				var $td = col.dom;
				if(!col.isWraped){
					var $checkbox = $("<input type='checkbox' class='g-chk-all' />").appendTo($td).wrap("<span></span>");
					//checkboxName
					if(opts.table.checkboxName.length){
						$checkbox.attr("data-checkboxname",opts.table.checkboxName);
					}
					wrapTd(col)
					col.isWraped = true
				}
				$td.appendTo($fixedTr);
			}

			if (opts.enableNum) {//序号列
				var col = header.colMap.numCol;
				var $td = col.dom;
				if(!col.isWraped){
					wrapTd(col)
					col.isWraped = true
				}
				$td.appendTo($fixedTr);
			}
			//固定列
			$.each(colMap.fixedCols,function (i,col) {
				var $td = col.dom;
				if(!col.isWraped){
					wrapTd(col)
					col.isWraped = true
				}
				$td.appendTo($fixedTr);
			})
			//后置固定列
			$.each(colMap.postFixedCols,function (i,col) {
				var $td = col.dom;
				if(!col.isWraped){
					wrapTd(col)
					col.isWraped = true
				}
				$td.appendTo($postFixedTr);
			})

			//常规列
			$.each(colMap.dataCols,function (i,col) {
				var $td = col.dom;
				if(!col.isWraped){
					wrapTd(col)
					col.isWraped = true
				}
				$td.appendTo($dataTr);
			})
			return _self.$element.find("[class^=grid-head]");
		}
		var creatHeaderByTable = function () {
			var header = {},
					colList = [],
					$header = $table.find("tr:eq(0) td");
					// header.cols = [];
			header.colMap = {chkCol:null,numCol:null,fixedCols:[],dataCols:[],postFixedCols:[]};
			if(opts.table.checkbox){//复选框
				// header.colMap.fixedCols.push(new Col($("<td data-checkbox ></td>")));
				var col = new Col($("<td data-checkbox ></td>"))
				header.colMap.chkCol = col
				colList.push(col);
			}
			if (opts.enableNum) {//激活序号列
				var col;
				if(!!$table.has('[data-number],[data-name="number"]').length){//存在序号列
					col = new Col($table.find('[data-number]'));
				}else {
					col = new Col($("<td data-number >"+strUtil['Num']+"</td>"));
				}
				col.isNum = true;//标识是序号列
				// header.colMap.fixedCols.push(col);
				header.colMap.numCol = col;
				colList.push(col);
			}
			$header.filter(':not([data-number])').each(function (i,td) {//除去序号列
				var col = new Col($(td));
				if(col.fixed){//固定列
					header.colMap.fixedCols.push(col);
				}else if (col.postFixed) {//后置固定列
					header.colMap.postFixedCols.push(col);
				}else {//常规列
					header.colMap.dataCols.push(col);
				}
			})
			// colList = colList.concat( header.colMap.fixedCols)
			// colList = colList.concat( header.colMap.dataCols)
			// colList = colList.concat( header.colMap.postFixedCols)
			//按顺序来的列集合
			header.colList = getColList(header);
			// header.colList = colList;
			// header.colList = $.extend([], header.colMap.fixedCols.concat(header.colMap.dataCols));

			$.each(colList,function(idx, col) {
				col.index = idx;
				col.currIndex = idx;
				if(!col.visible){
					col.dom.addClass("grid-ele-hidden");//表头td添加隐藏样式
				}
			});

			//渲染表格grid-head
			header.dom = renderHead(header);
			return header;
		}
		var createHeaderByColParams = function (colParams) {
			var _self = grid,header = {},newColList = [],
					newFixedList = [],	newPostFixedList = [], newDataList = [];
			header.colMap = {chkCol:null,numCol:null,fixedCols:[],dataCols:[],postFixedCols:[]};
			if (opts.table.checkbox) {
				var col = new PCol({checkbox:true},0)
				header.colMap.chkCol = col
			}
			if (opts.enableNum) {
				var col = new PCol({number:true,text:"序号",sort:true},1)
				header.colMap.numCol = col
			}
			$.each(colParams,function(i, nCol) {//遍历列配置集合
				var id = nCol.id || nCol.name;//列标识
				if (!id)  return true;
				if (nCol.number)  return true;//序号列不处理
				var col = new PCol(nCol)
				if(col.fixed){
					newFixedList.push(col);
				}else if (col.postFixed) {
					newPostFixedList.push(col);
				}else {
					newDataList.push(col)
				}
				newColList.push(col)
			});
			header.colMap.fixedCols = newFixedList;
			header.colMap.postFixedCols = newPostFixedList;
			header.colMap.dataCols = newDataList;
			header.colList = getColList(header);
			header.dom = renderHead(header);
			return header;
		}
		var bindGridEvent = function () {
			var _self = grid,
					$element = _self.$element;
			$element.on({
				"g.clearRow" : clearRow,
				"g.loadData" : loadData,
				"g.renderData" : renderData,
				"g.renderExtData" : renderExtData,
				"g.reDraw" : reDraw,
				"g.repage" : _refreshPage
			}).on('click','.first-page',_goFirstPage)
			.on('click','.prev-page',_goPrevPage)
			.on('click','.next-page',_goNextPage)
			.on('click','.last-page',_goLastPage)
			.on("blur",'.page-number',goNumPage)
			.on("change",".page-list",changePageList)
			.on('click','.g-chk-all',onChkAll)
			.on('click','.g-chk',onChk)
			.on('click','.g-row',onRowClick)
			.on('mouseenter','.g-row',onRowEnter)
			.on('mouseleave','.g-row',onRowLeave)
			.on('click','[class^="grid-head"] div[data-sortable]',onColSort)
			.on('click','.grid-query-trigger',onGridQueryShow)
			.on('click','.grid-col-prompt-trigger',onColPromptShow)
			.on('click','.grid-col-prompt-submit',onColPromptSubmit)
			.on('click','.grid-col-prompt-keep',onColPromptSave)
			.on('click','.grid-col-prompt-chk',onColPromptCheck)
			.on('click','.grid-col-prompt-chk-all',onColPromptCheckAll)
			.on('click','.grid-col-prompt-cancel',onColPromptCancel)
			.on('click','.grid-col-prompt-li',onColPromptSelected)
			.on('click','.grid-col-prompt-move-up',onColPromptMoveUp)
			.on('click','.grid-col-prompt-move-down',onColPromptMoveDown)
			.on('keyup','.grid-query-inp',onGridQuery)
			.on('click','.grid-query-clear',onGridQueryClear)
			var resize = utilFn.debounce(function(){
					if(!isVisible()) return false;
					resizeGrid();
			}, 25);
			$(window).on("resize",resize);
		}
		var goNumPage = function () {
			var _self = grid,pageOpt = _self.page,
				 	val = $(this).val(),
					numReg = new RegExp("^[0-9]*$");
			if(!numReg.test(val) || parseInt(val)>pageOpt.pageTotal || val.length <1 || parseInt(val) <= 0){
				$(this).val(pageOpt.pageNumber);
				return;
			}
			goPage(val);
		}
		var changePageList = function () {
			var _self = grid,
				loadMode = getLoadMode();
			gTrigger("g.repage");
			if (loadMode.hasPost) {
				loadData(true);
			}else {
				renderData(true);
			}
		}
		var createPage = function () {
			var _self = grid;
			_self.page = opts.page;
			var page = _self.page;
			//渲染分页
			page.enable = getLoadMode().hasPage;
			page.ele = renderPage();
			setPageVal();
			return page;
		}
		var initPage = function () {
			var _self = grid,
				pageOpt = _self.page,
				dataTotal;
			if(getLoadMode().hasUrl){//has url?
				dataTotal = pageOpt.dataTotal;
			}else{
				dataTotal = _self.data.length;
			}
			pageOpt.pageTotal = Math.ceil(dataTotal / pageOpt.pageSize);
			return pageOpt;
		}
		var renderPage = function () {
			var _self = grid,
				$grid = _self.$element,
				$page = $grid.find(".grid-page"),
				$pageGroup = $("<div class='page-group'></div>").appendTo($page),
				pageOpt = _self.page;

			var $firstP = $('<a href="javascript:;" class="first-page" title="'+ strUtil.firstP + '"></a>').appendTo($pageGroup);
			var $prevP = $('<a href="javascript:;" class="prev-page" title="'+ strUtil.prevP + '"></a>').appendTo($pageGroup);
			var $nextP = $('<a href="javascript:;" class="next-page" title="'+ strUtil.nextP + '"></a>').appendTo($pageGroup);
			var $lastP = $('<a href="javascript:;" class="last-page" title="'+ strUtil.lastP + '"></a>').appendTo($pageGroup);
			var $pageNumber = $("<input type='text' class='page-number' />").insertBefore($nextP);
			var $pageTotal = $("<span class='page-total'></span>").insertAfter($pageNumber);
			var $split = $("<span class='page-split'></span>").appendTo($pageGroup);
			var $pageList = $("<select class='page-list'></select>").appendTo($pageGroup);
			$split.clone().appendTo($pageGroup);
			var $dataTotal = $("<span class='page-data-total'></span>").appendTo($pageGroup);

			if(!pageOpt.enable) $pageGroup.hide();
			return {
				$page : $page,
				$firstP : $firstP,
				$prevP : $prevP,
				$nextP : $nextP,
				$lastP : $lastP,
				$pageNumber : $pageNumber,
				$pageTotal : $pageTotal,
				$pageList : $pageList,
				$dataTotal : $dataTotal
			}
		}
		var setPageVal = function () {
			var _self = grid,
					page = _self.page,
					ele = page.ele;
			ele.$pageNumber.val(page.pageNumber); // pageNumber
			ele.$pageTotal.text(page.pageTotal); // pageTotal
			ele.$dataTotal.text(page.dataTotal); // dataTotal
			ele.$pageList.empty(); // pageList
			for (var i = 0; i < page.pageList.length; i++) {
				var $o = $("<option></option>").appendTo(ele.$pageList);
				$o.text(page.pageList[i]).val(page.pageList[i]);
				if(page.pageSize == page.pageList[i]) $o.prop("selected","selected");
			};
		}
		var getLoadMode = function () {
			var _self = grid,
				loadModeStr = _self.opt.table.loadMode.toString();
			return {
				name : loadModeStr,
				hasPage : loadModeStr.indexOf('page') > -1,
				hasUrl : loadModeStr.indexOf('url') > -1,
				hasPost : loadModeStr.indexOf('post') > -1
			};
		}
		var goPage = function(index){
			var _self = grid,
				$grid = _self.$element,
				loadMode = getLoadMode(),
				pageOpt = _self.page;
			if(pageOpt.pageNumber == index) return;
			pageOpt.pageNumber = index;
			//todo 判断是否需要loadData
			if (loadMode.hasPost) {
				loadData(true);
			}else {
				renderData(true);
			}
		};
		var gTrigger = function (eventName,args) {
			var _self = grid,
					$element = _self.$element;
			$element.trigger(eventName,[args])
		}
		var renderData = function (isRerender) {
			var _self = grid,
					$grid = _self.$element,
					// rows = _self.renderRows,
					fixedTr = [],postFixedTr = [],dataTr = [];
			if(isRerender){
				if(getLoadMode().hasPage){
					_self.renderRows = sliceRowsByPage();
				}else {
					_self.renderRows = _self.rows;
				}
			}
			clearData();
			$.each(_self.renderRows ,function(i, row) {
				var $rows = renderRow(row);
				fixedTr.push($rows.fixedTr)
				postFixedTr.push($rows.postFixedTr)
				dataTr.push($rows.dataTr)
			});
			$grid.find(".grid-body-fixed table").append(fixedTr)
			$grid.find(".grid-body-post-fixed table").append(postFixedTr)
			$grid.find(".grid-body-data table").append(dataTr)
			_refreshPage();
			resizeGrid();
			if(!isRerender) refreshGridOpera();
			restoreGridScroll();
			if (opts.gridQuery) {
				resetGridQuery();//重置内过滤
			}
			synChkAll();//同步全选
			//回调
			_self.opt.table.onRenderDataFinish();
			_self.loading = false;
		}
		var renderExtData = function () {
			var _self = grid,
					$grid = _self.$element,
					rows = _self.extRows,
					fixedTr = [],postFixedTr = [],dataTr = [];

			clearExtData();
			$.each(rows,function(i, row) {
				row.isExt = true;
				var $rows = renderRow(row);
				$rows.fixedTr.find(".sortable").removeClass("asc desc");
				$rows.postFixedTr.find(".sortable").removeClass("asc desc");
				$rows.dataTr.find(".sortable").removeClass("asc desc");
				fixedTr.push($rows.fixedTr)
				postFixedTr.push($rows.postFixedTr)
				dataTr.push($rows.dataTr)
			});
			$grid.find(".grid-ext-fixed table").append(fixedTr);
			$grid.find(".grid-ext-post-fixed table").append(postFixedTr)
			$grid.find(".grid-ext-data table").append(dataTr);
			resizeGrid();
			// refreshGridOpera();
			restoreGridScroll();
		}
		var refreshData = function () {
			renderData(true);
			renderExtData();
		}
		var renderDataByRows = function (rows) {
			var _self = grid,
					$grid = _self.$element,
					// rows = _self.renderRows,
					fixedTr = [],postFixedTr = [],dataTr = [];
			clearData();
			$.each(rows ,function(i, row) {
				var $rows = renderRow(row);
				fixedTr.push($rows.fixedTr)
				postFixedTr.push($rows.postFixedTr)
				dataTr.push($rows.dataTr)
			});
			$grid.find(".grid-body-fixed table").append(fixedTr)
			$grid.find(".grid-body-post-fixed table").append(postFixedTr)
			$grid.find(".grid-body-data table").append(dataTr)
			_refreshPage();
			resizeGrid();
			// refreshGridOpera();
			restoreGridScroll();
			//回调
			_self.opt.table.onRenderDataFinish();
			_self.loading = false;
		}
		var clearData = function(){
			var _self = grid,
				$grid = _self.$element;
			$grid.find("[class^=grid-body-] table").empty();
			_self.sourceDataMap = {};
			$.each(_self.header.colList,function(i, col) {
				col.cells = [];
			});
		};
		var clearExtData = function(){
			var _self = grid,
				$grid = _self.$element;
			$grid.find("[class^=grid-ext-] table").empty();
			_self.sourceDataMap = {};
			$.each(_self.header.colList,function(i, col) {
				col.extCells = [];
			});
		};
		var	reDraw = function () {
			//设置高宽
			resizeGrid();
			setScroll();
		}
		var repage = function () {
			setPageVal();
		}
		var loadData = function (isPageTrigger) {
			var _self = grid, loadMode = getLoadMode(),
					promise;//异步
			_self.loading = true;
			onColPromptCancel();//隐藏列操作框
			_self.opt.table.onLoadData.apply(grid,[]);//onLoadData回调
			switch (loadMode.name){
				case "url_page_post":// url page(post)
					promise = _urlLoadDataPage();
					$.when(promise).done(function () {
							_initPageOpt();
							var pageOpt = _self.page,
									index = (pageOpt.pageNumber-1)*pageOpt.pageSize;
							_self.rows = creatRow(_self.data,index);
							_self.renderRows = _self.rows;
							renderData();
						})
				break;
				case "url_page_load":// url page(data)
					promise = _urlLoadData();
					$.when(promise).done(function () {
							_initPageOpt();
							if(!!!isPageTrigger) {//由page触发的，不重新构建row
								_self.rows = creatRow(_self.data);
							}
							_self.renderRows = sliceRowsByPage();
							renderData();
						})
				break;
				case "url_load":// url page(none)
					promise = _urlLoadData();
					$.when(promise).done(function () {
							_initPageOpt();
							_self.rows = creatRow(_self.data);
							_self.renderRows = _self.rows;
							renderData();
						})
				break;
				case "local_page_load":// local page(data)
					_initPageOpt();
					if(!!!isPageTrigger) {//由page触发的，不重新构建row
						_self.rows = creatRow(_self.data);
					}
					_self.renderRows = sliceRowsByPage();
					renderData();
				break;
				case "local_load":// local page(none)
					_self.rows = creatRow(_self.data);
					_self.renderRows = _self.rows;
					renderData();
				break;
				default:
				break;
			}
		}
		var sliceRowsByPage = function () {
			var _self = grid,
				tempRows = _self.rows,
				pageOpt = _self.page,
				pageSize = pageOpt.pageSize,
				pageNumber = pageOpt.pageNumber,
				pageTotal = pageOpt.pageTotal,
				renderData;
			//如果数据总量正好能被整除，说明则将页码设置为最后一页 modified by hanhui
			//sizeFresh:当删除的个数存在时，再强行跳至最后一页
			//使用场景，当当前页只剩下最后一条数据并进行删除时，需要强制跳回上一页
			if(tempRows.length % pageOpt.pageSize == 0 && pageOpt.sizeFresh){
				pageNumber = tempRows.length/pageOpt.pageSize;
				pageOpt.pageNumber = pageNumber;
			}
			pageOpt.dataTotal = tempRows.length;//总数
			var n1 = Math.max(pageSize *(pageNumber-1),0),
				n2 = n1 + pageSize;
			return tempRows.slice(n1,n2);
		}
		var creatRow = function (data,begIndex) {
			var _self = grid,rows = [];
			for (var i = 0; i < data.length; i++) {
				var idx = i;
				if(!!begIndex) idx += begIndex;
				rows.push(new Row(data[i],idx));
			}
			return rows;
		}
		var clearRow = function () {}
		var renderRow = function (row) {
			var _self = grid,
				$grid = _self.$element,
				$rows = build$Rows(row);

			setRowQueryText(row,$rows);//设置查询关键字

			//2.把行插入表格，同时绑定事件
			$rows.each(function(i,ele){
				ele._row = row;//dom中注入row
			});
			return {
				fixedTr : $rows.filter("[data-role='fixed']"),
				postFixedTr : $rows.filter("[data-role='postfixed']"),
				dataTr : $rows.filter("[data-role='data']")
			}
		}
		var build$Rows = function (row) {
				var _self = grid,
						$grid = _self.$element,
						$rows,queryText="",
						rowData = row.data;

				// var cols = _self.header.colMap;
				$rows = creatCloneRow();//第一行的拷贝，分别是fixed row和data row
				// $.each([].concat(cols.fixedCols,cols.dataCols),function(i, col) {
				$.each(_self.header.colList,function(i, col) {
					var idx = col.dom.index(),$pTr,$td;
					if (col.fixed) {
						$pTr = $rows.filter('[data-role="fixed"]')
					}else if (col.postFixed) {
						$pTr = $rows.filter('[data-role="postfixed"]')
					}else {
						$pTr = $rows.filter('[data-role="data"]')
					}
					$td = $pTr.children("td").eq(idx);
					//建立dom与col,row,cell之间的关系
					buildRelation($td,col,row)
					var $div = $rows.find("div.grid-chk-div");
					if (col.isChk) {//选择列
						if (row.isExt) {//汇总行不显示复选框
							$div.html("-");
						}else{
							var $checkbox = $("<input type='checkbox' class='g-chk' />").appendTo($div),
							name = opts.table.checkboxName;
							$checkbox[0].checked = row.chk;
						}
						$td = $div.parents("td");
					}else if (col.isNum) {//序号列
						$td = $rows.find("td[data-number]");
						var $div = $td.children(".grid-td-div"),
								index = row.index + 1;
						if (row.isExt) index = "-";//汇总行不显示序号
						$div.html(index);
						// $div.html(index).attr("data-sourcedata",index);
					}else if (col.isOpera) {//todo 操作列独立并且固定于表格右侧
						  var operakey = $td.data("operakey"),$div = $td.children(".grid-td-div"),
						 		 insertHtml = opts.table["operaCol"][operakey]?opts.table["operaCol"][operakey]($rows,$td,rowData,row.index):"";
						 $div.html(insertHtml);
 					}else if (!!col.name) {//具有name标识的
						var $div = $td.children(".grid-td-div"),
							sourceData = utilFn.getDeepVal(rowData,col.sourcekey),//原始数据
							insertHtml = utilFn.getDeepVal(rowData,col.name);//单元格文本
						if(col.fmt){
							insertHtml = col.fmt.apply(grid, [insertHtml,$td,rowData]);
						}
						// if (sourceData) {//插入排序数据
						// 	$td.attr("data-sourcedata",sourceData);
						// }
						$div.html(insertHtml);//插入显示数据
					}
				});

				row.dom = $rows;//dom归入row
				return $rows;
			}
		var buildRelation = function ($td,col,row) {
			$td[0]._col = col;
			$td[0]._row = row;
			var cell = new Cell($td);
			if (row.isExt){
				col.extCells.push(cell)
			}else {
				col.cells.push(cell)

			}
			row.cells.push(cell)
		}
		var setRowQueryText = function (row,$rows) {
			var innerHtml = "";
			$rows.each(function(index, el) {
				innerHtml += $(this).html()
			});
			var queryWords = innerHtml.match(/[^>]+(?=<\/\w{1,10}>)/g)||[];
			row.queryWords = queryWords;
			row.queryText = queryWords.join(",");
		}
		var queryRows = function () {//todo 行过滤函数
				var _self = grid,
						rows = grid.rows;
		}
		var onChk = function (e) {
			var $chk = $(this),
			 		_self = grid,
					$td = $chk.parents("td"), $row = $chk.parents("tr"),
					row = $row[0]._row;
			row.chk = this.checked;
			opts.table.onChecked.call(grid,row.dom,$td,row.data,this.checked);
			//同步全选
			synChkAll()
			e.stopPropagation();
		}
		var synChkAll = function () {
			var flag = true,_self = grid,
					checkAll = _self.$element.find(".g-chk-all")[0];
			if (!!!checkAll)  return;
			if (!_self.renderRows || !_self.renderRows.length) {
				checkAll.checked = false;
			}else {
				$.each(_self.renderRows,function(i, _row) {
					if(!_row.chk){//找其中选中的
						flag = false;
						return false;
					}
				});
				checkAll.checked = !!flag;//控制全选
			}
		}
		var onChkAll = function () {
			var $t = $(this),
					_self = grid,
					renderRows = _self.renderRows,//不包括汇总行
					chkedFlag = $t[0].checked;

			$.each(renderRows,function(i, row) {
				row.chk = chkedFlag;
				row.dom.find('[data-checkbox] :checkbox')[0].checked = chkedFlag;
			});
			opts.table.onCheckedAll.call(grid,$t[0].checked);
		}
		var onRowClick = function () {
			var $row = $(this),
					$grid = grid.$element,
					row = this._row,
					$rows = row.dom;
			$grid.find("tr.selected").not($rows).removeClass("selected");
			$rows.toggleClass("selected");
			opts.table.onRowClick($rows,row.data);
		}
		var onRowEnter = function () {
			var $row = $(this),
					row = this._row,
					$rows = row.dom;
			$rows.addClass('hover');
			opts.table.onRowEnter($rows,row.data);
		}
		var onRowLeave = function () {
			var $row = $(this),
					row = this._row,
					$rows = row.dom;
			$rows.removeClass('hover');
			opts.table.onRowLeave($rows,row.data);
		}
		var onColSort =function () {
			var _self = grid,$head = grid.header.dom,
					$prevSort = $head.find('div.asc,div.desc'),
					$div = $(this),
					col = $div.parents('td')[0]._col,
					row = $div.parents('tr')[0]._row;
			if ($prevSort.length && $prevSort[0] != this) {//不是同个排序列时
				$prevSort.parents('td')[0]._col.sortFlag = 0;//重置col状态
				$prevSort.removeClass('asc desc');
			}
			if ($div.hasClass('asc')) {//到降序
				col.sortFlag = 2;
				$div.removeClass('asc').addClass('desc')
			}else if ($div.hasClass('desc')) {//到常序
				col.sortFlag = 0;
				$div.removeClass('desc')
			}else {//到升序
				col.sortFlag = 1;
				$div.addClass('asc')
			}

			colSort(col,row);
		}
		var colSort = function (col,row) {
			var _self = grid,
					sortKey = col.sourcekey || col.name,
					rows = _self.rows,flag,
					sortFlag = col.sortFlag,
					sortFn;
			sortFn = function(currRow,nextRow) {
				var currVal = currRow.index, nextVal = nextRow.index;
				if (sortKey && sortFlag != 0) {
					// currVal = utilFn.getDeepVal(currRow.data,sortKey,"") || currRow.index;
					// nextVal = utilFn.getDeepVal(nextRow.data,sortKey,"") || nextRow.index;
					currVal = utilFn.getDeepVal(currRow.data,sortKey) ;
					nextVal = utilFn.getDeepVal(nextRow.data,sortKey) ;
					if (!currVal && isNaN(Number(currVal))) {
						currVal = currRow.index
					}
					if (!nextVal && isNaN(Number(nextVal))) {
						nextVal = nextRow.index
					}
				}
				if (!isNaN(Number(currVal)) && !isNaN(Number(nextVal))) {
					currVal = Number(currVal),nextVal = Number(nextVal);
					var f = sortFlag == 2 ? currVal > nextVal : nextVal > currVal  ;
					if(nextVal == currVal){
						flag = 0;
					}else{
						flag = f ? -1 : 1;
					}
				}else {
					flag = sortFlag == 1 ? nextVal.toString().localeCompare(currVal.toString()) : currVal.toString().localeCompare(nextVal.toString())
				}
				return flag;
			}

			if (col.sortFn) {
				sortFn = function (currRow,nextRow) {
					return col.sortFn.apply(_self, [currRow.data,nextRow.data,sortFlag,sortKey])
				}
			}

			rows = rows.sort(sortFn)
			_self.rows = rows;
			renderData(true);
		}
		var hideCol = function (col) {
			if (!!!col) return;//不存在则跳出
			var _self = grid;
			if (!!col._col) {//判断传入的是td还是col对象，td则直接获取col
				col = col._col//获取col对象
			}
			var $headTd = col.dom;//获取表头td
			col.visible = false;//col状态置为false
			$headTd.addClass("grid-ele-hidden");//表头td添加隐藏样式
			refreshData();
		}
		var showCol = function (col) {
			if (!!!col) return;//不存在则跳出
			var _self = grid;
			if (!!col._col) {//判断传入的是td还是col对象，td则直接获取col
				col = col._col//获取col对象
			}
			var $headTd = col.dom;//获取表头td
			col.visible = true;//col状态置为false
			$headTd.removeClass("grid-ele-hidden");//表头td添加隐藏样式
			refreshData();
		}
		var toggleColListVisible = function (header) {
			var header = header || grid.header,
					list = header.colList;
			$.each(list,function(idx, col) {
				if(!col.visible){
					col.dom.addClass("grid-ele-hidden");//表头td添加隐藏样式
				}else{
					col.dom.removeClass("grid-ele-hidden");
				}
			});
		}
		var toggleCol = function (header) {
			toggleColListVisible()
			refreshData();
		}
		var setColFormatter = function () {//通过参数设置列格式化函数
			if (!!!opts.colFormatter) return;
			var fmtMap = opts.colFormatter;
			for (var colName in fmtMap) {
				if(!!grid.colMap[colName] && typeof(fmtMap[colName]) == 'function'){
					var col = grid.colMap[colName];
					col.fmt = fmtMap[colName];
				}
			}
		}
		var setTitle = function(title){
	    var _self = grid,
	    	$grid = _self.$element,
	    	$title = $grid.find(".grid-title");
			grid.title = $title
	    // $title.empty();
      // $title.toggle(!!title);
			var $titleContent = $("<div class='grid-title-content'></div>").appendTo($title);
			$titleContent.html(title);
			if (opts.colOpera) {//colOperaTrigger
				addTitleOperaBtn('grid-col-prompt-trigger',"列操作",opts.colOperaClass,$title)
			}
			if (opts.gridQuery) {//gridQueryTrigger
				addTitleOperaBtn('grid-query-trigger',"行过滤",opts.gridQueryClass,$title)
			}
		};
		var addTitleOperaBtn = function (className,tip,extClass,$title) {
			var $titleOpera = $("<div class='grid-title-opera'></div>").appendTo($title);
			var $trigger = $("<span>").addClass(className).appendTo($titleOpera).prop("title",tip);
			if(opts.colOperaClass && opts.colOperaClass.length){
				$trigger.addClass(extClass)
			}else {
				$trigger.addClass('def')
			}
		}
		var onColPromptShow = function () {
			var _self = grid,
				$grid = _self.$element,
				$prompt = $grid.find(".grid-col-prompt"),
				$promptContent = $prompt.find(".grid-col-prompt-content").empty(),
				$colList = get$ColList().appendTo($promptContent),
				colList = grid.header.colList,
				fixedCols = grid.header.colMap.fixedCols,
				dataCols = grid.header.colMap.dataCols,
				postfixedCols = grid.header.colMap.postfixedCols;
			$prompt.toggleClass('active');
			onColPromptCheck();
			opts.onColPromptShow.apply(gridlist, [colList,fixedCols,dataCols,postfixedCols]);
		}
		var onColPromptCheck = function (event) {
			var _self = grid,
			  flag = true,//判断是否已经全选
			  $grid = _self.$element, $prompt = $grid.find(".grid-col-prompt"),
			  $promptContent = $prompt.find(".grid-col-prompt-content"),
				checkAll = $prompt.find('.grid-col-prompt-chk-all')[0];
			$promptContent.find(".grid-col-prompt-chk").each(function(i, chk) {
				if(!chk.checked){//找其中选中的
					flag = false;
					return false;
				}
			});
			checkAll.checked = !!flag;//控制全选
		}
		var onColPromptCheckAll = function (event) {
			var _self = grid,
				chkAll = event.target,
				$grid = _self.$element,
				$prompt = $grid.find(".grid-col-prompt"),
				$promptContent = $prompt.find(".grid-col-prompt-content");
			$promptContent.find(".grid-col-prompt-chk").each(function(i, chk) {
				chk.checked = chkAll.checked;
			});
		}
		var onColPromptSubmit = function () {
			var map = onColPromptSave();
			opts.onColOperaSubmit.apply(gridlist, [map.colList,map.fixedCols,map.dataCols]);
		}
		var onColPromptSave = function () {
			var _self = grid,
				$grid = _self.$element,
				$prompt = $grid.find(".grid-col-prompt"),
				$promptContent = $prompt.find(".grid-col-prompt-content"),
				colList = [],//新的表头集合
				fixedCols = [],
				postFixedCols = [],
				dataCols = []
			$promptContent.find(".grid-col-prompt-li").each(function (i,li) {
				var col = li._col,$li = $(li);
				col.visible = $li.find(".grid-col-prompt-chk")[0].checked;
				colList.push(col);
				if (col.fixed) {
					fixedCols.push(col);
				}else if (col.postFixed) {
					postFixedCols.push(col);
				}else{
					dataCols.push(col);
				}
			})
			$prompt.removeClass('active');
			grid.header.colMap.fixedCols = $.extend(true, [],fixedCols);
			grid.header.colMap.dataCols = $.extend(true, [],dataCols);
			grid.header.colMap.postFixedCols = $.extend(true, [],postFixedCols);
			grid.header.colList = getColList();
			renderHead(grid.header);
			toggleCol();
			return {
				colList : colList,
				fixedCols : fixedCols,
				dataCols : dataCols,
				postFixedCols : postFixedCols
			}
		}
		var onColPromptCancel = function () {
			var _self = grid,
				$grid = _self.$element,
				$prompt = $grid.find(".grid-col-prompt");
			$prompt.removeClass('active');
		}
		var onColPromptSelected = function (event) {
			var $li = $(event.target),
					$grid = grid.$element,
					$promptContent = $grid.find(".grid-col-prompt-content");
			if($li.closest('.grid-col-prompt-li').length){
				$li = $li.closest('.grid-col-prompt-li');
			}
			$li.siblings('.active').removeClass('active');
			$li.toggleClass('active');
		}
		var onColPromptMoveUp = function (event) {
			var $grid = grid.$element,
					$promptContent = $grid.find(".grid-col-prompt-content"),
					$li = $promptContent.find(".grid-col-prompt-li.active");
			var	$prev = $li.prev();
			if (!$li.length || !$prev.length || !$prev.is(":visible")) return;
			var col = $li[0]._col, pCol = $prev[0]._col;
			if (
					!((pCol.fixed && !col.fixed) || (col.postFixed && !pCol.postFixed ))
				) {
				$li.insertBefore($prev);
			}
		}
		var onColPromptMoveDown = function (event) {
			var $grid = grid.$element,
					$promptContent = $grid.find(".grid-col-prompt-content"),
					$li = $promptContent.find(".grid-col-prompt-li.active");
			var	$next = $li.next();
			if (!$li.length || !$next.length || !$next.is(":visible")) return;
			var col = $li[0]._col, nCol = $next[0]._col;
			if (
					!((!nCol.fixed && col.fixed )|| (nCol.postFixed && !col.postFixed ))
				) {
				$li.insertAfter($next);
			}
		}
		var get$ColList = function () {
			var _self = grid,
					list =  _self.header.colList,
					$ul = $("<ul>");
			$.each(list,function(i, col) {
				if(col.isChk || col.isNum) return true;
				var $li = $("<li>").appendTo($ul).addClass('grid-col-prompt-li'),
						$chk = $("<input>").attr("type","checkbox").appendTo($li).addClass('grid-col-prompt-chk'),
						$label = $("<label>").text(col.headerLabel).appendTo($li).addClass('grid-col-prompt-label')
				$chk[0].checked = col.visible;
				$li[0]._col = col;
				if (col.fixed || col.postFixed) {
					$li.addClass('fixed')
				}
				if (col.unmovable) {
					$li.addClass('unmovable')
				};
			});
			return $ul;
		}
		var getColList = function (header) {
			var header = header || grid.header,
					colMap = header.colMap,
					colList = [];
			if (opts.table.checkbox) {
				colList.push(colMap.chkCol)
			}
			if (opts.enableNum) {
				colList.push(colMap.numCol)
			}
			colList = colList.concat( header.colMap.fixedCols)
			colList = colList.concat( header.colMap.dataCols)
			colList = colList.concat( header.colMap.postFixedCols)
			$.each(colList,function(idx, col) {
				col.currIndex = idx;
			});
			return colList;
		}
		var buildTdByPCol = function (col) {
			var $td = $("<td>");
			for(var key in col){
            switch(key){
            case "headerLabel":
            case "text":
                $td.text(col[key]);
                break;
						case "fmt":
						case "formatter":
								if (typeof(col[key]) == "function") {
									$td[0].fmt = col[key];
									break;
								}
						case "sortFn":
								if (typeof(col[key]) == "function") {
									$td[0].sortFn = col[key];
									break;
								}
						case "dom":
							break;
            default:
								var value = col[key];
								if(!(typeof(value) == "boolean" && !!!value) || value == 0) {
									$td.attr("data-"+key,value);
								}else if (typeof(value) == "boolean") {
									$td.attr("data-"+key,value ? "true" : "false");
								}

                break;
            }
        }
			return $td;
		}
		var onGridQuery = utilFn.debounce(function (evt) {
			var _self = grid,
					$inp = $(evt.target),
					val = $inp.val();
			var	rows = queryRowsByKeyword(val) || []
			if (!!val) {
				renderDataByRows(rows);
			}else {
				renderData(true);
			}
		},800)
		var onGridQueryClear = function () {
			var _self = grid,
					$grid = _self.$element,
					$inp = $grid.find('.grid-query-inp');
			$inp.val("").trigger('keyup');
		}
		var queryRowsByKeyword = function(keyword){
				var _self = grid,
						rows = _self.renderRows,//当前可视的行
						cols = _self.header.colList,
						currCol,//根据关键字指定以某个列来过滤
						callback = opts.onGridQuery,
						outRows = [];
				//输入内容为 列名:关键字，则找出该列并以该列来过滤
				// if(/[^:]+:[^:]+/.test(keyword)){
				// 	var colText = keyword.replace(/([^:]+):[^:]+/,"$1"),
				// 			word = keyword.replace(/[^:]+:([^:]+)/,"$1");
				// 	$.each(cols,function(i, col) {
				// 		if (col.text == colText) {
				// 			currCol = col;
				// 		}
				// 	});
				// 	keyword = word;
				// }

				if(!!callback && typeof(callback) == 'function'){//回调函数
					outRows = callback.apply(_self, [keyword,rows,currCol]);
				}else if (!!currCol) {
					var isFuzzy = true;//是否模糊查询
					//keyword为((keyword))时，则不模糊查询
					if (/\(\([^\(\)]+\)\)/.test(keyword)) {
						isFuzzy = false;
						keyword = keyword.replace(/\(\(([^\(\)]+)\)\)/,"$1");
					}
					$.each(rows,function(i, row) {//按指定列过滤
						var $currTd;
						row.dom.find("td").each(function(j,td){//找出指定td
							if(td._col == currCol){
								$currTd = $(td)
							}
						})
						var queryText = $currTd.children(".grid-td-div").text();//获取指定td的文本

						if ((isFuzzy && queryText.indexOf(keyword)>-1) || (!isFuzzy && queryText == keyword)) {//配对
							outRows.push(row);
						}
					});
				}else{
					$.each(rows,function(i, row) {
						if (!!row.queryText && row.queryText.indexOf(keyword) > -1) {
							outRows.push(row);
						}
					});
				}
				return outRows;
		}
		var resizeGrid = function () {
			var _self = grid,
				$grid = _self.$element,
				$looseEle = $grid.find(".grid-looseEle"),
				$gridBody = $grid.find(".grid-body"),
				looseHeight,
				gWraperHeight = ~~opts.height,
				maxHeight = ~~opts.maxHeight;
			if(Boolean(opts.table["fullMode"])){
				var isBodyFull = $("body").height() == $(window).height();//body是否填满window
				var style,$div;//临时style样式及计算高度div
				if(!isBodyFull){//body不填满window的话，临时加个style样式使body填满页面
					var rule = "margin:0;padding:0;width:100%;height:100%;overflow:hidden;position: relative;";
					var sheet = (function() {
							style = document.createElement("style");
							style.appendChild(document.createTextNode(""));
							document.head.appendChild(style);
							var insertedStylesheet = style.sheet || style.styleSheet;
							return insertedStylesheet;
					})();
					function addCSSRule(sheet, selector, rules, index) {
							try{
									if("insertRule" in sheet) {
									sheet.insertRule(selector + "{" + rules + "}", index);
									}
									else if("addRule" in sheet) {
											sheet.addRule(selector, rules, index);
									}
							}catch(e){
									console.log(e)
							}
					}
							addCSSRule(sheet, "html,body", rule,0);
					}
					//创建临时div块，使其top跟grid一致，然后使其bottom至底，即得其高度(bottom:12px,其中距底为10px，再加上纵向边框高度2px)
					$div = $("<div>").appendTo(document.body).css({"position":"absolute","top":$grid.offset().top,"bottom":2,"left":0,"right":0})
					var sumHeight = Math.floor($div.height()); //向下取整
					$grid.parents().each(function(i,ele){
							var $ele = $(ele);
							var diff = $ele.outerHeight()-$ele.height()
							sumHeight -= diff/2;
					})
					//把临时铺满高度赋给grid
					// $grid.height(Math.floor(sumHeight));
					gWraperHeight = Math.floor(sumHeight);
					//回收临时div块及style
					$div.remove();
					!isBodyFull && $(style).remove();
			}

			if (!!maxHeight && maxHeight > 0) {
				gWraperHeight = maxHeight;
			}

			looseHeight = ~~(gWraperHeight - getSiblingsHeight($looseEle.filter(".grid-body-data")) - getSiblingsHeight($gridBody));

			if (!!maxHeight && maxHeight > 0) {
				var $scrollEle = $looseEle.find('.grid-body-scrollEle');
				if (!$scrollEle.length) {
					$scrollEle = $looseEle;
				}
				var scrollHeight = $scrollEle[0].scrollHeight;
				if (looseHeight > scrollHeight) {
					looseHeight = scrollHeight
				}
			}

			if (!!looseHeight && looseHeight > 0) {
				$looseEle.height(looseHeight);
			}else {
				$looseEle.height('auto');
			}

			$grid.width(opts.width);
			refreshScroll();
		}
		var getSiblingsHeight = function ($ele) {
			var _height = 0;
			$ele.siblings().not(function () {
				if ($(this).css("position") == "absolute") {
					return $(this);
				}
			}).each(function(i,ele){_height +=$(this).outerHeight()})
			return _height;
		}
		var onGridQueryShow = function (evt) {
			var _self = grid,
					$grid = grid.$element,
					$gridQuery = $grid.find('.grid-query'),
					$trigger = $(evt.target);
			$gridQuery.toggleClass('active');
		}
		var resetGridQuery = function () {
			var _self = grid,
					$grid = _self.$element,
					$inp = $grid.find('.grid-query-inp');
			$inp.val("")
		}
		var refreshSort = function(){
			var _self = grid;
			_self.$element.find(".asc,.desc").removeClass("asc desc");
		};
		var refreshChecked = function(){
			var _self = grid,
				$grid = _self.$element,
				$head = $grid.find("[class^=grid-head-]");
				$head.find(":checkbox").each(function(i,ele){
					ele.checked = false;
				})
		}
		var refreshGridOpera = function(){
			var _self = grid;
			refreshSort();
			refreshChecked();
		}
		var compareColParams = function (col,nColParams) {
			var keyNameMap = {//属性名转换字典
		      "formatter" : "fmt"
		  }
			$.each(nColParams,function(key, val) {
				key = keyNameMap[key] || key;//转换属性名
				col[key] = val;
			});
			return col;
		}
		var isVisible =function(){
				var _self = grid,
						$grid = _self.$element;
				return !$grid.is(":hidden");
		}
		//----------滚动条控制相关------------------------------------------------------------------------
		var restoreGridScroll = function(){
		    var _self = grid;
		    var $grid = _self.$element;
		    $grid.find(".grid-body-scrollEle").scrollLeft(0).scrollTop(0);
		    $grid.find(".grid-head-data .grid-scroll-wrap").scrollLeft(0);
		    $grid.find(".grid-ext-data .grid-scroll-wrap").scrollLeft(0);
		    $grid.find(".grid-body-fixed,.grid-body-post-fixed").scrollTop(0);
		    refreshScroll();
		}
		var refreshScroll = function  () {
			var _self = grid,
			    $grid = _self.$element;
			if(!$grid.$x || !$grid.$y) return;
			setScrollPos();
			setScrollSize();
		}
		//同步容器间的偏移值
		var aynScrollLeft = function  () {
			var _self = grid,
					$grid = _self.$element,
					$scrollEleHead = $grid.find(".grid-head-data .grid-scroll-wrap"),
					$scrollEleExt = $grid.find(".grid-ext-data .grid-scroll-wrap"),
					$fixedEle = $grid.find(".grid-body-fixed"),
					$scrollEle = $grid.find(".grid-body-scrollEle"),
					scrollLeft = $scrollEleHead.scrollLeft();
			$scrollEle.add($scrollEleExt).scrollLeft(scrollLeft)
		}
		//设置滚动条
		var setScroll = function  () {
			var _self = grid,
				$grid = _self.$element,
				$scrollBody = $grid.find(".grid-body-data"),
			 	$scrollEle = $("<div>").addClass("grid-body-scrollEle").appendTo($scrollBody);
				// 	$scrollTable = $scrollBody.children("table").appendTo($scrollEle);
			$scrollBody.children().wrap("<div class='grid-body-scrollEle'>");
			$scrollEle = $scrollBody.find(".grid-body-scrollEle")
			_self.$element.$x = $("<div class='grid-handle-x'></div>").appendTo($scrollBody);
			_self.$element.$y = $("<div class='grid-handle-y'></div>").appendTo($scrollBody);

			setScrollEvent();
			refreshScroll();
		};
		//改变滚动条状态
		var setScrollSize = function  () {
			var _self = grid,
				$grid = _self.$element,
				scrollEle = $grid.find(".grid-body-scrollEle")[0],
				scrollEleHead = $grid.find(".grid-head-data").find(".grid-scroll-wrap")[0],
				clientWidth = Math.max(scrollEle.clientWidth,scrollEleHead.clientWidth),
				scrollWidth = Math.max(scrollEle.scrollWidth,scrollEleHead.scrollWidth),
				clientHeight = scrollEle.clientHeight,
				scrollHeight = scrollEle.scrollHeight,
				w = Math.max(clientWidth- (scrollWidth - clientWidth),50),
				h = Math.max(clientHeight- (scrollHeight - clientHeight),50),
				$x = $grid.$x,
				$y = $grid.$y;
			scrollEle.scrollBarWidth = w;
			scrollEle.scrollBarHeight = h;
			$x.toggle(scrollWidth - clientWidth > 2 && scrollWidth > 50);//可滚动距离在2px以内则不展示滚动条
			$y.toggle(scrollHeight - clientHeight > 2 && scrollHeight > 50);
			$x.width(w);
			$y.height(h);

		}
		//定位滚动条
		var setScrollPos = function  () {
			var _self = grid,
				$grid = _self.$element,
				scrollEle = $grid.find(".grid-body-scrollEle")[0],
				scrollEleHead = $grid.find(".grid-head-data").find(".grid-scroll-wrap")[0],
				clientWidth = Math.max(scrollEle.clientWidth,scrollEleHead.clientWidth),
				scrollWidth = Math.max(scrollEle.scrollWidth,scrollEleHead.scrollWidth),
				scrollLeft = Math.max(scrollEle.scrollLeft,scrollEleHead.scrollLeft),
				scrollTop = scrollEle.scrollTop,
				clientHeight = scrollEle.clientHeight,scrollBarWidth = scrollEle.scrollBarWidth,
				scrollHeight = scrollEle.scrollHeight,scrollBarHeight = scrollEle.scrollBarHeight,
				$x = $grid.$x,
				$y = $grid.$y;
			$x[0].style.left = ((clientWidth - scrollBarWidth) * scrollLeft / (scrollWidth - clientWidth)) + 'px';
			$y[0].style.top = ((clientHeight - scrollBarHeight) * scrollTop / (scrollHeight - clientHeight)) + 'px';
		}
		//设置滚动条事件
		var setScrollEvent =function  () {
			var _self = grid,
				$grid = _self.$element,
				$scrollEle = $grid.find(".grid-body-scrollEle"),
				$scrollEleHead = $grid.find(".grid-head-data").wrapInner("<div class='grid-scroll-wrap'></div>").find(".grid-scroll-wrap"),
				$scrollEleExt = $grid.find(".grid-ext-data").wrapInner("<div class='grid-scroll-wrap'></div>").find(".grid-scroll-wrap"),
				$fixedEle = $grid.find(".grid-body-fixed,.grid-body-post-fixed"),
			 	scrollEle = $scrollEle[0],scrollEleHead = $scrollEleHead[0],
			 	$x = $grid.$x,//x滑块
				$y = $grid.$y,//y滑块
				scrollPageY = 0,scrollY = 0,//y滚动
				scrollPageX = 0,scrollX = 0,//x滚动
				isY = false,
				isScorlling = false;//是否在移动中
			//按下
			$x.add($y).on("mousedown",function  (e) {
				isY = $(this).hasClass("grid-handle-y");
				$(this).addClass('active')
				if(isY){
					scrollPageY = e.clientY;
					scrollY = scrollEle.scrollTop;
				}else{
					scrollPageX = e.clientX;
					scrollX = scrollEle.scrollLeft;
				}
				isScorlling = true;
				document.body.onselectstart = function(){return false};
				return false;
			})
			//移动
			$grid.on("mousemove",function  (e) {
				if(!isScorlling) return;
				var per,
						clientWidth = Math.max(scrollEle.clientWidth,scrollEleHead.clientWidth),
						scrollWidth = Math.max(scrollEle.scrollWidth,scrollEleHead.scrollWidth),
						scrollLeft = Math.max(scrollEle.scrollLeft,scrollEleHead.scrollLeft),
						scrollTop = scrollEle.scrollTop,
						clientHeight = scrollEle.clientHeight,scrollBarWidth = scrollEle.scrollBarWidth,
						scrollHeight = scrollEle.scrollHeight,scrollBarHeight = scrollEle.scrollBarHeight;
				if(isY){
					per = (scrollHeight - clientHeight) / (clientHeight - scrollBarHeight);
					var scrollTop =  scrollY - (scrollPageY - e.clientY) * per;
					scrollEle.scrollTop = scrollTop;
					$fixedEle.scrollTop(scrollTop)
				}else{
					per = (scrollWidth - clientWidth) / (clientWidth - scrollBarWidth);
					var scrollLeft = scrollX - (scrollPageX - e.clientX) * per;
					scrollEle.scrollLeft = scrollLeft;
					$scrollEleHead.scrollLeft(scrollLeft);
					$scrollEleExt.scrollLeft(scrollLeft);
				}
				setScrollPos();
			})
			//松开
			$grid.on("mouseup mouseleave",function  (e) {
				if(!isScorlling) return;
				$x.removeClass('active');
				$y.removeClass('active');
				isScorlling = false;
				document.body.onselectstart = function(){return true};
			})
			var mouseScroll = function  (evt) {
				if(scrollEle.scrollHeight - scrollEle.clientHeight < 3) return true;//
				var speed = scrollEle.scrollHeight/20;
				evt = evt || event;
				var delta = evt.wheelDelta || evt.detail,//ff是evt.detail
					condition = evt.wheelDelta? delta < 0 : delta > 0;//ff是向下滚动是正值

				if(condition){
					if(scrollEle.scrollTop >= (scrollEle.scrollHeight - scrollEle.clientHeight)) return true;
					scrollEle.scrollTop += speed;
				}else{
					if(scrollEle.scrollTop == 0) return true;
					scrollEle.scrollTop -= speed;
				}
				$fixedEle.scrollTop(scrollEle.scrollTop);
				setScrollPos();
			}

			var mouseEvtCallBack = function(evt){
				var flag =	mouseScroll(evt);
				evt.preventDefault();//滚轮事件不冒泡
				// if (!flag) {//滚轮事件只有在滚不动的时候再冒泡
				// 	evt.preventDefault();
				// }
			}

			//鼠标滚轮
			$grid.find(".grid-body")[0].onmousewheel = mouseEvtCallBack
			$grid.find(".grid-body")[0].addEventListener("DOMMouseScroll", mouseEvtCallBack);
		}
		//----------列宽控制相关------------------------------------------------------------------------
		var colResize = function() {
			var _self = grid,
					$wraper = _self.$element,
					$head = $wraper.find("[class^=grid-head-]"),
					$tdList = $head.find("td[data-dragable]"),//可拖拽的列
					colList = grid.header.colList,
					isDraging = false,//是否在拖拽状态
					$currHandler,$currTd,isPostFixed,
					dragX;//上次鼠标的位置
			$.each(colList,function(i, col) {
				if (col.dragable && !col.dom.find(".grid-resize-Handler").length) {
					$("<div class='grid-resize-Handler'></div>").appendTo(col.dom)
				}
			});
			// if(!$tdList.length) return;//若无可拖拽列，则跳出
			// $tdList.each(function (i,ele) {
			// 	var $td = $(this);
			// 	$("<div class='grid-resize-Handler'></div>").appendTo($td)
			// })
			//清除之前绑定的事件
			$head.off(".drag");
			$wraper.off(".drag");
			//绑定事件
			$head.on("mousedown.drag",".grid-resize-Handler",function(e){
				startDrag(e);
				e.stopPropagation();
			})
			$wraper.on({
				"mousemove.drag":function(e){
					draging(e);
				},
				"mouseleave.drag":function(e){
					endDrag(e);
				},
				"mouseup.drag":function(e){
					endDrag(e);
				}
			})

			//开始拖拽
			var startDrag = function(e){
				if(isDraging) return;
				isDraging = true;
				$currHandler = $(e.target);
				$currHandler.addClass('active');
				$currTd = $currHandler.parents("td");//当前td
				isPostFixed = $currTd[0]._col.postFixed;
				dragX = e.clientX || e.pageX;
				document.body.onselectstart = function(){return false};//禁止浏览器默认选中行为
				e.stopPropagation();
			}
			//结束
			var endDrag = function(e){
				if(!isDraging) return;
				isDraging = false;
				!!$currHandler && $currHandler.removeClass('active');
				document.body.onselectstart = function(){return true};//解除浏览器默认选中行为
				e.stopPropagation();
			};
			//拖拽中
			var $gridData = $wraper.find(".grid-body .grid-data");  //右半边表格，需要在draging中判断其宽度
			var draging = function(e){
				if(!isDraging) return;
				var X = e.clientX || e.pageX;
				var w = !isPostFixed?X-dragX:dragX-X;
				if($gridData.outerWidth() < 120 && w > 0){
					return ;
				}
				setColSize($currTd,w);
				dragX = X;
				refreshScroll();
				aynScrollLeft();//同步上下容器滚动偏移
				e.stopPropagation();
				e.preventDefault();
			};
		};
		var setColSize = function($td,w){
			var $div = $td.children("div.grid-td-div"),
			col = $td[0]._col,
			row = $td[0]._row,
			newWidth = $div.width() + w;
			$div.width(newWidth);
			col.width = newWidth;
			$.each([].concat(col.cells, col.extCells),function(i, cell) {
				cell.innerDom.width(newWidth)
			});
		};
		var autoCalColSize = function () {
			var _self = grid,$wraper = _self.$element,
					$bodyHeader = $wraper.find(".grid-head-data"),
					restSpace = $bodyHeader[0].clientWidth - $bodyHeader.find('table').width()
			if (restSpace <= 0 ) return false;
			//获取中间显示列数，然后用剩余空间去均分
			var dataCols = $.map(_self.header.colMap.dataCols,function(col) {if (col.visible)  return col;}),
					colSize = dataCols.length,
					avgWidth = restSpace/colSize;
			$.each(dataCols,function(i, col) {
				var $div = col.dom.children('.grid-td-div');
				if (i < dataCols.length-1) {
					$div.width($div.width() + avgWidth)
				}else{//因为存在不均分的宽度，故最后一列通过重新计算剩余空间
					var newSpace = $bodyHeader[0].clientWidth - $bodyHeader.find('table').width();
					$div.width($div.width() + newSpace + 1)//加1px是为了使边框重合以达到边框看起来不“粗”
				}
			});
			return dataCols;
		}
		var resetColSize = function () {//todo 重置列宽

		}
		// ---------一些内部类-----------------------------------------------------------------------------
		var Cell = function ($td) {
			var _self = this;
			_self.id;
			_self.col = $td[0]._col;
			_self.row = $td[0]._row;
			_self.dom = $td;
			_self.innerDom = $td.children("div.grid-td-div");
			_self.sortData = utilFn.getDeepVal(_self.row.data,_self.col.sourcekey);
			_self.data = utilFn.getDeepVal(_self.row.data,_self.col.name);
			$td[0]._cell = _self;
		}
		var Col = function ($td,idx) {//通过td创建的col
			var getBoolByDataKey = function (key,defVal) {//defVal为没有配置该项时的值
				var val = $td.attr(key);
				switch (val) {
					case "":
					case "true":
					case true:
						val = true;
						break;
				  case "false":
				  case false:
						val = false;
						break;
					case undefined:
					default:
						val = defVal;
						break;
				}
				return val;
			}

			var _self = this;
			_self.dom = $td;
			_self.index = idx;//初始列位置
			_self.currIndex = _self.index;//当前列位置
			_self.enable = true;//列使能
			_self.sortFlag = 0;//0 常序，1 升序，2 降序
			_self.name = $td.data('name');//列标识
			_self.id = $td.data('id') || _self.name;//todo 参数需要追加data-id
			_self.align = $td.data('align');
			_self.width = $td.data('width') || $td[0].clientWidth;
			_self.sourcekey = $td.data('sourcekey');
			_self.fmt = (function () {
				var fn;
				if (_self.dom && _self.dom[0].fmt) {
					fn = _self.dom[0].fmt;
				}else {
					try {
						fn = eval("window." + $td.data("fomatter"));
					} catch (e) {
						console.log("Invalid fomatter on col:"+ _self.id);
					}
				}
				return fn;
			})();
			_self.sortFn = (function () {
				var fn;
				if (_self.dom && _self.dom[0].sortFn) {
					fn = _self.dom[0].sortFn;
				}else {
					try {
						fn = eval("window." + $td.data("sortfn"));
					} catch (e) {
						console.log("Invalid sortFn on col:"+ _self.id);
					}
				}
				return fn;
			})();
			_self.fixed = (function () {
				var id = _self.id,
						fixedlist = grid.opt.fixedTable.fixedColName;
				return fixedlist.indexOf(id) > -1 || getBoolByDataKey('data-fixed',false);
			})();
			_self.postFixed = (function () {
				var id = _self.id,
						fixedlist = grid.opt.fixedTable.postFixedColName;
				var flag = fixedlist.indexOf(id) > -1 || getBoolByDataKey('data-postfixed',false)
				if (flag) {//如果同时配置了fixed和postFixed，则fixed失效
					_self.fixed = false;
				}
				return flag;
			})();
			_self.unmovable = false,//为true时不可在prompt中编辑
			_self.visible = getBoolByDataKey('visible',true) && getBoolByDataKey('data-visible',true) && !getBoolByDataKey('data-hide',false)
			_self.sortable = getBoolByDataKey('data-sort',false) || getBoolByDataKey('data-sortable',false);
			_self.dragable = getBoolByDataKey('dragable',false) || getBoolByDataKey('data-dragable',false);
			_self.text = $td.data("text") || $td.text();
			_self.headerLabel = _self.text;
			if($td.is("[data-checkbox]")){
				_self.fixed = true;
				_self.isChk = true;
				_self.dragable = false;
				_self.unmovable = true;
			}else if ($td.is("[data-number]")){
				_self.fixed = true;
				_self.isNum = true;
				_self.dragable = true;
				_self.unmovable = true;
			}else if($td.is("[data-opera]")){
				_self.isOpera = true;
				_self.dragable = true;
				_self.operakey = $td.data('operakey');
				_self.name = _self.operakey;
			}
			$td[0]._col = _self;
			grid.colMap[_self.id] = _self;
			_self.cells = [];
			_self.extCells = [];
		}
		var PCol = function (param,idx) {
			var $td = buildTdByPCol(param);
			return new Col($td,idx);
		}
		var Row = function (rowdata,i) {
			var _self = this;
			_self.id;
			_self.data = rowdata;
			_self.dom;
			_self.index = i;
			_self.cells = [];
			_self.chk = !!utilFn.getDeepVal(rowdata,opts.table.checkboxName);
			_self.queryText;
			_self.isExt = false;
		}
		var Grid = function () {
			var _self = this;
			_self.data = opts.table.data;//缓存的数据集合
			_self.extData = opts.extTable.data;//缓存的数据集合
			_self.rows = [];//行集合
			_self.extRows = [];//当前渲染的行集合
			_self.opt = {
				table : opts.table,
				extTable : opts.extTable,
				fixedTable : opts.fixedTable
			}
			_self.promise;//缓存异步对象
			_self.renderRows;//当前渲染的行集合
			// _self.renderData;//渲染的缓存数据集合
			_self.loading;
			_self.$element;//dom
			_self.gid = creatGId();//表格标识
			_self.header;//表头对象
			_self.$rowClone;//复制行
			_self.page;
			_self.colMap = {};//列MAP
		}

		// ---------组件类-----------------------------------------------------------------------------
		var grid = new Grid();

		init(opts);

		// ---------暴露接口-----------------------------------------------------------------------------
		function GridList(){
			// this.data = opts.table.data;

		}

		GridList.prototype.setTitle = function(title){
		  var $title = grid.title;
			$title.html(title);
		};
		GridList.prototype.clearAllData = function(){//清除所有数据,包括汇总行
      var _self = grid;
      clearData();
      clearExtData();
    };
		GridList.prototype.setTable = function(option){
			var _self = grid,
				tableOpt = _self.opt.table
			_self.opt.table = $.extend({},tableOpt,option)
		}
		GridList.prototype.setPage = function(option){
			var _self = grid,
				pageOpt = _self.page
			_self.opt.page = $.extend({},pageOpt,option)
		}
		GridList.prototype.getCheckedRow = function(){
			var _self = grid,
					$grid = _self.$element,
					rows = grid.renderRows,
					checkedObj = {rows:[],rowDatas:[]};
			$.each(rows,function(i,row) {
				if(!!row.chk){
					checkedObj["rows"].push(row.dom);
					checkedObj["rowDatas"].push(row.data);
				}
			});
			return checkedObj;
		}
		GridList.prototype.loadData = function(reSize){//更新grid的table参数,重新加载数据
			var _self = grid;
			_self.page.sizeFresh=reSize||0;
			loadData();
		};
		GridList.prototype.refreshExtData = function(){
			var _self = grid;
			renderExtData();
			resizeGrid();
		};
		GridList.prototype.updateData = function(data){
			if(!data){
				console.log("no data");
				return false;
			}
			var _self = grid;
			// _self.opt.table.data = data;
			_self.data = data;
			loadData();
		};
		GridList.prototype.updateExtData = function(data){
			if(!data){
				console.log("no data");
				return false;
			}
			var _self = grid;
			_self.extData = data;
			_self.extRows = creatRow(_self.extData);
			renderExtData();
		};
		GridList.prototype.showCol = function(){
			showCol.apply(grid,arguments);
		}
		GridList.prototype.hideCol = function(){
			hideCol.apply(grid,arguments);
		}
		GridList.prototype.hideOperaCol = function(){
			var _self = grid,
					cols = _self.header.colMap;
			$.each([].concat(cols.fixedCols,cols.dataCols),function(i, col) {//遍历所有列
				if (col.isOpera) {//对操作列进行隐藏
					hideCol(col)
				}
			})
		}
		GridList.prototype.hideRow = function($td){
			var _self = grid,
				$grid = _self.$element,
				row = $td.parents("tr")[0]._row;
			row.dom.addClass("grid-ele-hidden");
			resizeGrid();
		}
		GridList.prototype.showRow = function($td){
			var _self = grid,
				$grid = _self.$element,
				row = $td.parents("tr")[0]._row;
			row.dom.removeClass("grid-ele-hidden");
			resizeGrid();
		}
		GridList.prototype.isVisible =function(){
		    return isVisible.apply(grid,arguments);
		}
		GridList.prototype.clearExtData = function(){}
		GridList.prototype.getCols = function(){
			var _self = grid;
			return $.extend([],_self.header.colList);
		}
		GridList.prototype.setCols = function (newCols) {
			this.setHeader.apply(this, arguments);
		}
		GridList.prototype.setHeader = function (newCols) {
			var _self = grid,
					header = _self.header,
					colList = header.colList,
					newColList = [],newFixedList = [], newDataList = [],newPostFixedList = [],
					tempColMap = {};
			$.each(colList,function(i, col) {//建立临时map，方便查找
				var id = col.id || col.name;//列标识
				if (id) {
					tempColMap[id] = col;
				}
			});
			$.each(newCols,function(i, nCol) {//遍历列配置集合
				var id = nCol.id || nCol.name,
						col;//列标识
				if (!id || nCol.isNum || nCol.isChk)  return true;
				if (!!tempColMap[id]) {
					col = compareColParams(tempColMap[id],nCol);
				}else {
					col = new PCol(nCol);
				}
				// var col = tempColMap[id] || new PCol(nCol);
				if(col.fixed){
					newFixedList.push(col);
				}else if (col.postFixed) {
					newPostFixedList.push(col);
				}else {
					newDataList.push(col)
				}
				newColList.push(col)
			});
			header.colMap.fixedCols = newFixedList;
			header.colMap.dataCols = newDataList;
			header.colMap.postFixedCols = newPostFixedList;
			header.colList = getColList();
			setColFormatter();
			renderHead(header);
			colResize();
			toggleCol();
		}
		GridList.prototype.getDom = function () {
			return grid.$element;
		}
		GridList.prototype.getSorceTable = function () {
			return $table;
		}
		GridList.prototype.getOptions = function () {
			return opts;
		}
		GridList.prototype.getLoadMode = function () {
			return getLoadMode();
		}
		GridList.prototype.autoFitTable = function () {
			var flag = autoCalColSize();
			if (flag) {//false则不需要重新渲染数据
				refreshData();
			}
		}

		var gridlist = new GridList();
		$table.data()["grid"] = gridlist;
		opts.onComplete.apply(gridlist,[grid.$element]);
		return gridlist;
	}
	$.fn.gridList.setDefault = function(option){
		setting = $.extend(true,{},setting,option);
	}
})(jQuery)

module.exports = jQuery;
