import fetch from '../config/fetch'
import * as home from 'src/service/tempdata/test'
import * as menu from 'src/service/tempdata/menu'
import login from 'src/service/tempdata/login'
import menu0 from 'src/service/tempdata/menu0'
import linkData from 'src/service/tempdata/linkData'
import roleData from 'src/service/tempdata/role'
import logData from 'src/service/tempdata/oLog'
import {baseUrl} from 'src/config/env.js'

console.log(baseUrl);

let rand = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAUABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD72m8deK/HPiTVdL8FDTdO0nSpGsrzxHrEEtyrXi8SRW9urRGRYzhWlMirvyiq5RyvK6H8V/E+q6dLqvhnxb4a+JdrEbp20mx09tPvrhYJmgle1led0kVZUKLmPaxK/vMMGr518caP4M1uLw14dv73WLv4jyC/dfC2mRwySSSJqs9w06pLFKkTySmQszEJJGSJFdRiua+JH7PXxF8HeFvAuv8AjjxDZ2+j/wBpaZoB8NWyR3M1rFNfBo8TyoYywkkHmCOJEaP92VMYC1XLZXuYKa5nFLb8T9FPCniiz8Y+G9N1vSrhriwvoFmickFsHqG54YHII7EUV5j+y94fj8MfDW80mGW4vNMs9d1OGxuJ0DNLGLuTe+UjVcNN5zDAxgiiot5mm/Q9L0jwF4f0bxBqPiC10mzi1zU9hvNQECCeYqoUbnAyeAK+dfFXhT/hc37V2p6B4i1fU20Tw1pCajpdhazLHFBeMcC5I2nfInBXdkAgcGiigs+kfCfgzSfBnh2w0LSbZrfTdPiWCCNpXdtoHVnYlnYkkszEliSSSTRRRTA//9k=";

/**
 * 创建临时数据
 */
const setpromise = data => {
	return new Promise((resolve, reject) => {
		resolve(data)
	})
}

// console.log(process.env.NODE_ENV);

//编译环境使用真实数据
if (process.env.NODE_ENV == 'development') {//dev环境
  var getRand = () => {return setpromise({result:1,data:rand});};
  var sendLogin = () => {console.log(arguments);return setpromise(login);}
  var getMenu = () => setpromise(menu0);
  var getLinkData = () => setpromise(linkData);
  var getRoleData = () => setpromise(roleData);
  var getOLogs = () => setpromise(logData);
  var getSLogs = () => setpromise(logData);
  var addoLog = () => setpromise({ result: 2, message: '添加成功' });
}else{//pro环境
  var getRand = () => fetch('POST', '/rand', {});
  var sendLogin = (form) => fetch('POST', '/login', form);
  var getMenu = () => fetch('POST', '/main', {});
  var getLinkData = () => fetch('POST', 'link/linkData', {});
  var getRoleData = () => fetch('POST', 'role/viewRoles', {});
  var getOLogs = () => fetch('POST', 'log/viewOperationLogs', {});
  var getSLogs = () => fetch('POST', 'log/viewSafeLogs', {});
  var addoLog = (form) => fetch('POST', 'log/addOperationLog', form);
}


/**
 * 以下Api接口不需要进行反向代理
 */

// var sendLogin = (code, mobile, validate_token) => setpromise(login.userInfo);
export {getRand,sendLogin,getMenu,getLinkData,getRoleData,getOLogs,getSLogs,addoLog }
