/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * imgBaseUrl: 图片所在域名地址
 *
 */
let baseUrl;
let routerMode;
let isPro = process.env.NODE_ENV == 'production';
// const imgBaseUrl = 'https://fuss10.elemecdn.com';

if (!isPro) {
	baseUrl = '';
	routerMode = 'hash'
}else{
	// baseUrl = 'https://mainsite-restapi.ele.me';
	// baseUrl = document.getElementById('basepath').getAttribute('href') || "";//自动获取basepath
	baseUrl = "/wfp";//自动获取basepath
	routerMode = 'hash'
}

export {
  isPro,
	baseUrl,
	routerMode,
	// imgBaseUrl
}
