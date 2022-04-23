"use strict";__filename="background/browser.js",define(["require","exports","./store","./utils"],function(n,e,r,u){
var t,o,i,f,l,c,a,s,d,v,m,p,b,g;Object.defineProperty(e,"__esModule",{value:true}),
e.import2=e.n=e.s=e._n=e.removeTempTab=e.downloadFile=e.makeTempWindow_r=e.makeWindow=e.openMultiTabs=e.tabsCreate=e.selectWndIfNeed=e.selectWnd=e.selectTab=e.In=e.Pn=e.Wn=e.qn=e.selectIndexFrom=e.selectFrom=e.getCurWnd=e.Fn=e.Mn=e.getCurTabs=e.getCurTab=e.isTabMuted=e.getTabUrl=e.getGroupId=e.tabsUpdate=e.tabsGet=e.On=e.Tn=e.$n=e.An=e.Bn=e.Cn=void 0,
e.Cn=chrome,e.Bn=e.Cn.tabs,e.An=e.Cn.windows,e.$n=function(){return e.Cn.sessions},e.Tn=function(){
return e.Cn.webNavigation},e.On=function(){return e.Cn.runtime.lastError},e.tabsGet=e.Bn.get,e.tabsUpdate=e.Bn.update,
e.getGroupId=function(n){var e=n.groupId;return-1!==e&&null!=e?e:null},e.getTabUrl=function(n){
return n.url||n.pendingUrl||""},e.isTabMuted=function(n){return n.mutedInfo.muted},e.getCurTab=e.Bn.query.bind(null,{
active:true,currentWindow:true}),e.getCurTabs=e.Bn.query.bind(null,{currentWindow:true}),e.Mn=e.getCurTabs,
e.Fn=function(){return true},e.getCurWnd=function(n,u){var t={populate:n}
;return r.J>=0?e.An.get(r.J,t,u):e.An.getCurrent(t,u)},t=function(n){return n[e.selectIndexFrom(n)]},e.selectFrom=t,
e.selectIndexFrom=function(n){for(var e=n.length;0<--e;)if(n[e].active)return e;return 0},e.qn=function(n){
return/^(edge-)?extension:/.test(n)?r.e.Re+"-"+n.slice(n.indexOf("ext")):n},e.Wn=function(n){
var r=[].slice.call(arguments,1),t=u.g(),o=t.xn,i=t.zn;return r.push(function(n){var r=e.On()
;return i(r?void 0:null!=n?n:null),r}),n.apply(void 0,r),o},o=function(n){return n!==r.C?function(){var r=e.On()
;return n(!r),r}:e.On},e.Pn=o,e.In=function(n){return new Promise(function(e){n(e)})},i=function(n,e){var u=r.Y.get(n)
;return 1===u||2===u&&!(!r.we&&!e)},f=function(n,r){e.tabsUpdate(n,{active:true},r)},e.selectTab=f,l=function(n){
return n&&e.An.update(n.windowId,{focused:true}),e.On()},e.selectWnd=l,c=function(n){n.windowId!==r.J&&e.selectWnd(n)},
e.selectWndIfNeed=c,a=function(n,u,t){var o=n.url;return o?i(o,2===r.A)&&delete n.url:(o=r.newTabUrl_f,
2===r.A&&(-1===t?o.includes("pages/blank.html")&&o.startsWith(location.origin+"/"):!t&&o.startsWith(location.protocol))||i(o,2===r.A)||(n.url=o),
n.url||delete n.url),e.Bn.create(n,u)},e.tabsCreate=a,s=function(n,r,u,t,o,i,f){var l;o=false!==o,
l=null!=i?e.getGroupId(i):null,o||null==l||delete n.index,l=o&&null!=l&&e.Bn.group?l:void 0,e.tabsCreate(n,function(u){
var o,i,c,a,s;if(e.On())return f&&f(),e.On();for(n.index=u.index,n.windowId=u.windowId,null!=l&&e.Bn.group({tabIds:u.id,
groupId:l}),f&&f(u),n.active=false,o=null!=n.index,i=t?t.length:1,c=null!=l?function(n){return n&&e.Bn.group({
tabIds:n.id,groupId:l}),e.On()
}:e.On,t.length>1&&(t[0]=n.url),a=0;a<r;a++)for(s=a>0?0:1;s<i;s++)t.length>1&&(n.url=t[s]),o&&++n.index,e.Bn.create(n,c)
},u)},e.openMultiTabs=s,d=function(n,u,t){var o,f=false!==n.focused
;(u=u?"minimized"===u===f||"popup"===n.type||"normal"===u||"docked"===u?"":u:"")&&!u.includes("fullscreen")&&(n.state=u,
u=""),
n.focused=true,(o=n.url)||null!=n.tabId||(o=n.url=r.newTabUrl_f),"string"==typeof o&&i(o,n.incognito)&&delete n.url,
e.An.create(n,u||!f||t?function(n){if(t&&t(n),!(u||!f)||!n)return e.On();var r=f?{}:{focused:false};u&&(r.state=u),
e.An.update(n.id,r)}:e.On)},e.makeWindow=d,v=function(n,r,u){var t="number"==typeof n;e.An.create({type:"normal",
focused:false,incognito:r,state:"minimized",tabId:t?n:void 0,url:t?void 0:n},u)},e.makeTempWindow_r=v,
m=function(n,r,t,o){e.Wn(e.Cn.permissions.contains,{permissions:["downloads"]}).then(function(t){var i,f,l,c;t?(i={url:n
},
r&&(f=/\.[a-z\d]{1,4}(?=$|[?&])/i,r=(r="#"===(r=u.cn(r))[0]?r.slice(1):r).replace(/[\r\n]+/g," ").replace(/[/\\?%*:|"<>_]+/g,"_"),
f.test(r)||(l=f.exec(n),r+=l?l[0]:n.includes(".")?"":".bin"),i.filename=r),c=e.Wn(e.Cn.downloads.download,i),
o&&c.then(function(n){return o(void 0!==n)})):o&&o(false)})},e.downloadFile=m,p=function(n){e.Bn.remove(n,e.On)},
e.removeTempTab=p,e._n=function(n){
return n=n.slice(0,99).toLowerCase(),1!==r.Y.get(n)&&(n.startsWith("about:")?"about:blank"!==n:n.startsWith("chrome:")?!n.startsWith("chrome://downloads"):n.startsWith(r.e.Re)&&!("string"!=typeof r.e.De?r.e.De.test(n):n.startsWith(r.e.De))||r.we&&/^(edge|extension):/.test(n)&&!n.startsWith("edge://downloads"))
},b=function(n,r){var u,t,o=e.Cn.permissions;u=Promise.all(n.map(function(n){return n&&e.Wn(e.Cn.permissions.contains,n)
})),t=n.map(function(n){return n&&(n.permissions||n.origins)[0]}),u.then(function(n){
var e=false,u=false,i=function(i,c){var a,s,d,v,m=!c;if(c){for(s of(a=c.permissions)||[])(d=t.indexOf(s))>=0&&(n[d]=i,
m=true);for(v of(!a||a.length<=0)&&c.origins||[])if("chrome://*/*"!==v)(d=t.indexOf(v))>=0&&(n[d]=i,
m=true);else for(d=0;d<t.length;d++)(t[d]||"").startsWith("chrome://")&&(n[d]=i,m=true)}
m&&(false===r(n,true)&&(e=u=false),e!==n.includes(false)&&o.onAdded[(e=!e)?"addListener":"removeListener"](f),
u!==n.includes(true)&&o.onRemoved[(u=!u)?"addListener":"removeListener"](l))},f=i.bind(null,true),l=i.bind(null,false)
;n.includes(false)||n.includes(true)?i(true):r(n,false)})},e.s=b,g=function(n){var u,t=location.origin.length
;for(u of r.e.He.slice(0,-1))e.Bn.executeScript(n,{file:u.slice(t),allFrames:true},e.On)},e.n=g;e.import2=function(e){
return new Promise(function(r,u){n([e],r,u)}).then(n=>n)},r.W<6&&(r.pe=new Promise(function(n){
var r=e.Cn.runtime.onInstalled,u=function(e){var t=u;t&&(u=null,n(e),r.removeListener(t))};r.addListener(u),
setTimeout(u,6e3,null)}))});