import {
	baseUrl
} from './env'

export default async(type = 'GET', url = '', data = {}, method = 'fetch') => {
	type = type.toUpperCase();
	url = baseUrl + url;
  url = url.replace(/\/\//g,'/');//处理双斜杠问题
  // console.log(url);

  // get请求的参数处理
	if (type == 'GET') {
		let dataStr = ''; //数据拼接字符串
		Object.keys(data).forEach(key => {
			dataStr += key + '=' + data[key] + '&';
		})

		if (dataStr !== '') {
			dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
			url = url + '?' + dataStr;
		}
	}

  // fetch参数构建
	if (window.fetch && method == 'fetch') {
		let requestConfig = {
			credentials: 'include',
			method: type,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			mode: "cors",
			cache: "force-cache"
		}

		if (type == 'POST') {
			Object.defineProperty(requestConfig, 'body', {
				value: JSON.stringify(data)
			})
		}

    var responseJson = {};// 返回给客户端客户端业务
		try {
			var response = await fetch(url, requestConfig);
      var resText = await response.text();
      var isJsonRes = !/^<[^<]+/.test(resText);//判断服务器容器是否返回了网页
      if (isJsonRes) {
        // responseJson = await response.json();
        responseJson = JSON.parse(resText);
      }
		} catch (error) {
			// throw new Error(error)
		}

    if (!!window.app ) {//app构建完成的前提下

      // 状态码标识判断
      // 200 正常业务返回
      // 非200 业务不正常

      // 匹配不到资源
      if (response.status == 200) {
        // 业务标识判断
        // 0 未知错误
        // 1 后端业务错误
        // 2 后端业务正常
        if (responseJson.result < 2) {
          window.app.$notify({
           title: responseJson.result == 1 ?  "错误" : "警告",
           message: responseJson.info || "错误" ,
           type: responseJson.result == 1 ? 'error' : 'warning'
          });
        }else{
          window.app.$notify({
           title: "服务器错误",
           message: '状态：' + response.status,
           type: 'error'
          });
        }
      }
    }

		return responseJson;
	} else {
		let requestObj;
		if (window.XMLHttpRequest) {
			requestObj = new XMLHttpRequest();
		} else {
			requestObj = new ActiveXObject;
		}

		let sendData = '';
		if (type == 'POST') {
			sendData = JSON.stringify(data);
		}

		requestObj.open(type, url, true);
		// requestObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		requestObj.setRequestHeader("Content-type", 'application/json');
		requestObj.send(sendData);

		requestObj.onreadystatechange = () => {
			if (requestObj.readyState == 4) {
				if (requestObj.status == 200) {
					let res = requestObj.response
					if (typeof res !== 'object') {
						res = JSON.parse(res);
					}
					return res;
				} else {
					throw new Error(requestObj)
				}
			}
		}
	}
}
