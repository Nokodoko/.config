"use strict"
;__filename="background/main.js",define(["require","exports","./store","./utils","./browser","./settings","./ports","./key_mappings","./run_commands","./normalize_urls","./parse_urls","./exclusions","./ui_css","./eval_urls","./open_urls","./all_commands","./request_handlers","./tools"],function(n,o,e,t,i,u,s,r,c){
var a;Object.defineProperty(o,"__esModule",{value:true}),t=t,u=u,a=function(n){var o,t=e.z.get(e.L)
;"quickNext"===n&&(n="nextTab"),
(o=r.vt)&&o.get(n)?null==t||4&t.Ln||e.L<0?c.executeShortcut(n,t):i.tabsGet(e.L,function(o){
return c.executeShortcut(n,o&&"complete"===o.status?e.z.get(o.id):null),i.On()}):o&&null!==o.get(n)&&(o.set(n,null),
console.log("Shortcut %o has not been configured.",n))},e.Q=function(){
if(6===e.W)return e.Q?(t.d(u.lo.then.bind(u.lo,e.Q)),void(e.Q=null)):(e.y||(u.co("keyMappings"),
0===e.fe&&(r.et["m-s-c"]=36)),u.co("exclusionListenHash"),u.co("vomnibarOptions"),u.co("autoDarkMode"),
u.co("autoReduceMotion"),i.Cn.runtime.onConnect.addListener(function(n){return s.OnConnect(n,0|n.name)}),
i.Cn.runtime.onConnectExternal.addListener(function(n){var o,t=n.sender,i=n.name
;if(t&&s.isExtIdAllowed(t)&&i.startsWith("vimium-c.")&&(o=i.split("@")).length>1){
if(o[1]!==e.e.GitVer)return n.postMessage({N:2,t:1}),void n.disconnect();s.OnConnect(n,32|o[0].slice(9))
}else n.disconnect()}),void i.Cn.extension.isAllowedIncognitoAccess(function(o){e.e.Ge=false===o,setTimeout(function(){
new Promise(function(o,e){n(["/background/others.js"],o,e)}).then(n=>n),setTimeout(function(){new Promise(function(o,e){
n(["/background/browsing_data_manager.js"],o,e)}).then(n=>n),new Promise(function(o,e){
n(["/background/completion_utils.js"],o,e)}).then(n=>n),new Promise(function(o,e){n(["/background/completion.js"],o,e)
}).then(n=>n)},200)},200)}))},i.Cn.commands.onCommand.addListener(a),u.lo.then(function(){u.co("extAllowList"),
i.Cn.runtime.onMessageExternal.addListener(function(n,o,t){if(s.isExtIdAllowed(o))if("string"!=typeof n){
if("object"==typeof n&&n)switch(n.handler){case"shortcut":var i=n.shortcut;i&&a(i+"");break;case"id":t({name:"Vimium C",
host:location.host,shortcuts:true,injector:e.e.Ae,version:e.e.Oe});break;case 99:t({s:n.scripts?e.e.He:null,
version:e.e.Oe,host:"",h:"@"+e.e.GitVer});break;case"command":c.executeExternalCmd(n,o)}}else c.executeExternalCmd({
command:n},o);else t(false)}),u.co("vomnibarPage",null),u.co("searchUrl",null)}),
i.Bn.onReplaced.addListener(function(n,o){var t,i=e.z.get(o);if(i)for(t of(e.z.delete(o),e.z.set(n,i),i.po))t.s.Hn=n}),
e.M._u=function(n,o,t){setTimeout(function(){e.M._u(n,o,t)},210)},e.W=4|e.W,e.Q(),globalThis.onunload=function(n){
if(!n||n.isTrusted){for(var o of e.U)o.disconnect();e.z.forEach(function(n){for(var o of n.po.slice(0))o.disconnect()})}
},globalThis.window||(globalThis.onclose=onunload),e.de<59||!t.k("\\p{L}","u",0)?t.l("words.txt").then(function(n){
e.ee=n.replace(/[\n\r]/g,"").replace(/\\u(\w{4})/g,function(n,o){return String.fromCharCode(+("0x"+o))})}):e.ee=""});