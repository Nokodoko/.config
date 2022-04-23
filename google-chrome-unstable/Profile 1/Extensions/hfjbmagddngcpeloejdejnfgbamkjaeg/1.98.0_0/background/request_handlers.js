"use strict"
;__filename="background/request_handlers.js",define(["require","exports","./store","./utils","./browser","./parse_urls","./settings","./ports","./exclusions","./ui_css","./i18n","./key_mappings","./run_commands","./run_keys","./open_urls","./frame_commands","./tools","./normalize_urls"],function(n,u,t,r,e,o,i,f,l,c,s,a,v,d,m,b,p,g){
var _,y,j,k,N,h;Object.defineProperty(u,"__esModule",{value:true}),r=r,i=i,_=-1,t.K=[function(n,u){var r,e,o=n.k,l=i.oo
;if(!(o>=0&&o<l.length))return t.N=u,f.complainLimits(s.Yn("notModify",[o]));e=t.h,
t.ce[r=l[o]]!==n.v&&(e?e.then(function(){i.ro(r,n.v)}):i.ro(r,n.v))},function(n,u){var t="object"==typeof n
;return p.Ct._r(u.s.Un,t?n.q:"",t?1:n)},function(n,u){var t=o.fu(n);if(null==n.i)return t;u.postMessage({N:44,i:n.i,s:t
})},function(n,u){var i=n.u,l=n.e,c=o.iu(n)
;r.wn(),n.e=c,null==c.p?(t.N=u,f.showHUD(c.u)):l||i!==c.u?!u||"file://"===c.u.slice(0,7).toLowerCase()&&"file://"!==i.slice(0,7).toLowerCase()?e.tabsUpdate({
url:c.u}):v.sendFgCmd(0,false,{r:1,u:c.u}):(t.N=u,f.showHUD("Here is just root"),n.e={p:null,u:"(just root)"})
},function(n,u){var r,e,i=o.fu(n);if(!i||!i.k)return t.N=u,f.showHUD(s.Yn("noEngineFound")),
void(n.n&&v.runNextCmdBy(0,n.n));e=n.o||{},r=n.t.trim()&&t.i(n.t.trim(),524288,e.s).trim()||(n.c?t.p(e.s):""),
Promise.resolve(r).then(function(r){
var o=null===r?"It's not allowed to read clipboard":(r=r.trim())?"":s.Yn("noSelOrCopied");if(o)return t.N=u,
f.showHUD(o),void(n.n&&v.runNextCmdBy(0,n.n));e.k=null==e.k?i.k:e.k,t.K[6]({u:r,o:e,r:0,
n:v.parseFallbackOptions(n.n)||{}},u)})},function(n,u){var r,o=n.s,i=false!==n.a;t.N=f.findCPort(u),
"number"!=typeof o?e.$n()?(e.$n().restore(o[1],function(){var n=e.On();return n&&f.showHUD(s.Yn("noSessionItem")),n}),
i||((r=u.s.Hn)>=0||(r=t.L),r>=0&&e.selectTab(r))):f.complainNoSession():e.selectTab(o,function(n){
return e.On()?f.showHUD(s.Yn("noTabItem")):e.selectWnd(n),e.On()})},m.openUrlReq,function(n,u){var r,e,o,i
;(e=t.z.get(r=u.s.Hn))?u!==(i=e.Qn)&&(e.Qn=u,t.ne&&(o=u.s.ve)!==i.s.ve&&t.b(r,o)):t.ne&&t.b(r,u.s.ve)},function(n,u){
var r,e,o,i,c,s=u;if((s||(s=f.indexFrame(n.tabId,n.frameId)))&&(e=(r=s.s).fr,!(o=t.z.get(r.Hn))||!o.En)){
if(i=l.Jn?l.Kn(r.fr=u?n.u:n.url,r):null,
r.ve!==(c=null===i?0:i?1:2))r.ve=c,t.ne&&o.Qn===s&&t.b(r.Hn,c);else if(!i||i===l.Kn(e,r))return;s.postMessage({N:1,p:i,
f:0})}},function(n,u){var r,e=n.t||0;t.N=u,t.V=e||t.V>0?1:-1,t.B=n.k,v.replaceCmdOptions(n.f||{}),
2!==e?1===e?b.parentFrame():b.nextFrame():(r=t.z.get(u.s.Hn))?b.focusFrame(r.Qn,r.po.length<=2,1,t.Be):f.safePost(u,{
N:45,l:t.B})},function(n,u){var r,e,o,i=t.z.get(u.s.Hn);if(i&&(u.s.Ln|=4,i.Ln|=4,!(i.po.length<2)))for(e of(r={N:8},
i.po))o=e.s.Ln,e.s.Ln|=4,4&o||e.postMessage(r)},function(n,u,r){var o,i,l=u.s.Hn,c=t.z.get(l),s=n.u
;if(!c||c.po.length<2)return false;for(i of c.po)if(i.s.fr===s){if(o){o=null;break}o=i}return o?(t.B=n.k,k(n,u,o,1),
true):!!e.Tn()&&(e.Tn().getAllFrames({tabId:u.s.Hn},function(e){var o,i,c=0,s=u.s.Dn;for(o of e)if(o.parentFrameId===s){
if(c){c=0;break}c=o.frameId}(i=c&&f.indexFrame(l,c))&&(t.B=n.k,k(n,u,i,1)),f.sendResponse(u,r,!!i)}),u)},function(n,u){
b.initHelp(n,u)},function(n,u){t.z.get(u.s.Hn).Ln|=4,u.s.Ln|=12,u.postMessage({N:12,H:t.re})},function(n,u){
var e,i,f,l,c=n.i;if(t.B=0,null!=n.u)i=n.t,l=n.u,l=(f=(e=n.m)>=40&&e<=64)?o.ru(l,true):l,l=t.i(l,f?1048576:524288),
v.replaceCmdOptions({url:l,newtab:null!=i?!!i:!f,keyword:n.o.k}),N(n.f),t.V=1;else{if(true!==n.r)return
;if(null==t.Be||"omni"!==t.Be.k){if(c)return;t.Be=r.pn(),t.V=1}else if(c&&t.Be.v===t.e.Fe)return}t.N=u,b.showVomnibar(c)
},function(n,u){f.isNotVomnibarPage(u,false)||t.M._u(n.q,n,j.bind(u,0|n.i))},function(n,u){
var e,i=n.u||n.s||"",l=n.o||{},c=null!=n.s&&n.m||0,s=l.s,a=l.k,v=c>=40&&c<=64&&(!s||false!==s.r),d=n.d?false!==l.d:!!l.d
;if(d)if("string"!=typeof i)for(e=i.length;0<=--e;)v&&(i[e]=o.ru(i[e]+"")),i[e]=r.un(i[e]+"");else v&&(i=o.ru(i)),
i=r.un(i);else"string"==typeof i&&i.length<4&&i.trim()&&" "===i[0]&&(i="");i=i&&t.f(i,n.j,s,a),t.N=u,
i=n.s&&"object"==typeof n.s?"[".concat(n.s.length,"] ")+n.s.slice(-1)[0]:i,
f.showHUD(d?i.replace(/%[0-7][\dA-Fa-f]/g,decodeURIComponent):i,n.u?14:15)},function(n,u){
var e,o,i,f,l,c,s=null!=u?u.s:null;null===s||4&s.Ln||(s.Ln|=4,(e=t.z.get(s.Hn))&&(e.Ln|=4)),i=1,
null!=(f=/^\d+|^-\d*/.exec(o=n.k))&&(o=o.slice((l=f[0]).length),i="-"!==l?parseInt(l,10)||1:-1),
(c=t.R.get(o))||(f=o.match(a.kt),i=1,c=t.R.get(o=f[f.length-1])),r.wn(),c&&(36===c.wt&&c.ht&&d.$t(c),n.e&&(t.Ie={
element:r.nn(n.e)}),v.executeCommand(c,i,n.l,u,0,null))},v.waitAndRunKeyReq,function(n,u){switch(t.N=u,n.a){case 1:
return p.It.xt(n,u);case 0:return p.It.zt(n,u);case 2:return p.It.Et(n.u);default:return}
},m.du,v.onConfirmResponse,function(n,u){
var r,o,i=n.t,l=n.s,c=n.u,a="history"===i&&null!=l?"session":i,v="tab"===a?a:a+" item",d=function(n){
Promise.resolve(s.Yn("sugs")).then(function(u){f.showHUD(s.Yn(n?"delSug":"notDelSug",[s.br(u,a[0])||v]))})}
;t.N=f.findCPort(u),
"tab"===a&&t.L===l?f.showHUD(s.Yn("notRemoveCur")):"session"!==a?t.M.yu("tab"===a?l:c,a,d):(null===(r=e.$n())||void 0===r?void 0:r.forgetClosedTab)&&(o=l,
e.$n().forgetClosedTab(o[0],o[1]).then(function(){return 1},t.C).then(d))},b.openImgReq,function(n,u){t.N=null,
m.openJSUrl(n.u,{},function(){t.N=u,f.showHUD(s.Yn("jsFail"))})},function(n,u){var r
;2!==n.c&&4!==n.c?k(n,u,(null===(r=t.z.get(u.s.Hn))||void 0===r?void 0:r.Sn)||null,n.f):f.getParentFrame(u.s.Hn,u.s.Dn,1).then(function(r){
var e;k(n,u,r||(null===(e=t.z.get(u.s.Hn))||void 0===e?void 0:e.Sn)||null,n.f)})},c.ii,function(n,u){
v.replaceCmdOptions({active:true,returnToViewport:true}),t.N=u,t.V=1,b.performFind()},b.framesGoBack,function(){
return s.dr&&s.dr(),s.$r},function(n,u){u.s.Ln|=8},function(n,u){v.replaceCmdOptions({mode:n.c?"caret":"",start:true}),
N(n.f),t.N=u,t.V=1,b.enterVisualMode()},function(n){if(performance.now()-n.r.n<500){var u=n.r.c;u.element=r.nn(n.e),
d.runKeyWithCond(u)}},function(n,u){var r=n.o||{},i=t.i(o.ru(n.u,true),1048576,r.s);i=i!==n.u||r.k?g.rr(i,r.k,0):i,
t.N=u,f.showHUD(i,78),e.downloadFile(i,n.f,n.r||"",n.m<42?function(r){r||t.K[23]({m:36,f:n.f,u:i},u)}:null)
},function(n,u,t){return setTimeout(function(){f.sendResponse(u,t,9)},n),u},function(n){var u=n.v,t=u!==!!u
;f.showHUD(s.Yn(t?"useVal":u?"turnOn":"turnOff",[n.k,t?JSON.stringify(u):""]))},function(n,u){
var r=u.s.Hn,e=t.z.get(r>=0?r:t.L);t.K[17](n,e?e.Qn:null)},function(n,u,t){
return!(false!==u.s&&!u.s.fr.startsWith(location.origin+"/"))&&(h(n.q,n.i,u).then(function(n){u.postMessage(t?{N:4,m:t,
r:n}:n)}),u)},function(n,u){var r=n.u,e=r.indexOf("://")
;r=(r=e>0?r.slice(r.indexOf("/",e+4)+1):r).length>40?r.slice(0,39)+"\u2026":r,t.N=u,f.showHUD(r,78)}],
j=function(n,u,e,o,i,l,c,s){var a,v,d,m,b,p=this.s.fr,g=2===n?2:0
;if(1===n&&t.de>=58)if(p=p.slice(0,p.indexOf("/",p.indexOf("://")+3)+1),
null!=(m=-1!==_?null===(a=t.z.get(_))||void 0===a?void 0:a.Sn:null)&&(m.s.fr.startsWith(p)?g=1:_=-1),
g);else for(b of t.z.values())if((d=(v=b.Sn)&&v.s)&&d.fr.startsWith(p)){g=1,_=d.Hn;break}f.safePost(this,{N:43,a:e,c:s,
i:g,l:u,m:o,r:c,s:i,t:l}),r.wn()},k=function(n,u,r,e){r&&2!==r.s.ve?r.postMessage({N:7,
H:e||4!==n.c?f.ensureInnerCSS(u.s):null,m:e?4:0,k:e?t.B:0,f:{},c:n.c,n:n.n||0,a:n.a}):(n.a.$forced=1,
v.portSendFgCmd(u,n.c,false,n.a,n.n||0))},N=function(n){n&&("string"==typeof n&&(n=d.parseEmbeddedOptions(n)),
n&&"object"==typeof n&&Object.assign(t.Be,r.mn(n)))},h=function(u,t,r){return y||(y=new Promise(function(u,t){
n(["/background/sync.js"],u,t)}).then(n=>n).then(function(){return i.lo}).then(function(){
return e.import2("/background/page_handlers.js")})),y.then(function(n){return Promise.all(u.map(function(u){
return n.onReq(u,r)}))}).then(function(n){return{i:t,a:n.map(function(n){return void 0!==n?n:null})}})},
globalThis.window&&(globalThis.window.onPagesReq=function(n){return h(n.q,n.i,null)})});