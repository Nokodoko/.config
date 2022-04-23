"use strict"
;__filename="background/tools.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./settings","./ports","./ui_css","./i18n","./run_commands","./open_urls","./tab_commands"],function(n,t,e,r,o,i,u,a,c,f,l,s,v,d){
var _;Object.defineProperty(t,"__esModule",{value:true}),t._t=t.Mt=t.Ct=t.It=t.St=void 0,r=r,a=a,t.St={jt:function(n,t){
return"vimiumContent|"+n+(t?"|"+t:"")},Lt:function(n,t){var i=o.Cn.contentSettings;try{i&&i.images.get({
primaryUrl:"https://127.0.0.1/"},o.On)}catch(n){i=null}
return i?i[n]&&!/^[A-Z]/.test(n)&&i[n].get?!(!t.startsWith("read:")&&r.kn.test(t)&&!t.startsWith(e.e.Re))&&(c.complainLimits(l.Yn("changeItsCS")),
true):(c.showHUD(l.Yn("unknownCS",[n])),true):(c.showHUD("Has not permitted to set contentSettings"),true)},
Ot:function(n,t){var o,u,a,f,s,v,d,_,m,p
;if(n.startsWith("file:"))return(o=e.de>=56?1:t>1?2:0)?(c.complainLimits(1===o?l.Yn("setFileCS",[56]):l.Yn("setFolderCS")),
[]):[n.split(/[?#]/,1)[0]];if(n.startsWith("ftp"))return c.complainLimits(l.Yn("setFTPCS")),[]
;if(u=n.match(/^([^:]+:\/\/)([^\/]+)/),a=i.lr.exec(u[2]),f=[(n=u[1])+(s=a[3]+(a[4]||""))+"/*"],
t<2||r.sn(a[3],0))return f;for(a=null,d=(v=r.fn(s))[0],_=v[1],m=Math.min(d.length-_,t-1),
p=0;p<m;p++)s=s.slice(d[p].length+1),f.push(n+s+"/*");return f.push(n+"*."+s+"/*"),
m===d.length-_&&"http://"===n&&f.push("https://*."+s+"/*"),f},Nt:function(n){var t,e,r;for(e of n.po){
if(r=new URL(e.s.fr).host,t&&t!==r)return true;t=r}return false},Rt:function(n,e){var r=o.Cn.contentSettings[n]
;null==e?(r.clear({scope:"regular"}),r.clear({scope:"incognito_session_only"},o.On),a.io(t.St.jt(n),null)):r.clear({
scope:e?"incognito_session_only":"regular"})},At:function(n,r){var o=n.type?""+n.type:"images"
;return!t.St.Lt(o,"http://a.cc/")&&(t.St.Rt(o,r?r.s.Un:2===e.A),Promise.resolve("images"===o&&l.Yn(o)).then(function(n){
c.showHUD(l.Yn("csCleared",[n||o[0].toUpperCase()+o.slice(1)]))}),true)},Pt:function(n,e,r,o){
var i=n.type?""+n.type:"images",u=r[0];n.incognito?t.St.Ut(e,i,u,o):t.St.Wt(i,e,u,"reopen"===n.action,o)},
Wt:function(n,r,u,c,f){var l=i.er(u.url);t.St.Lt(n,l)?f(0):o.Cn.contentSettings[n].get({primaryUrl:l,
incognito:u.incognito},function(i){t.St.qt(n,l,r,{scope:u.incognito?"incognito_session_only":"regular",
setting:i&&"allow"===i.setting?"block":"allow"},function(r){var i,l,v;r?f(0):(u.incognito||(i=t.St.jt(n),
"1"!==e.ie.get(i)&&a.io(i,"1")),v=!o.$n()||e.de>=70&&(l=e.z.get(u.id))&&l.po.length>1&&t.St.Nt(l),
u.incognito||c?d.Ft(u):u.index>0?d.Ft(u,v?0:2):o.getCurWnd(true,function(n){
return n&&"normal"===n.type?d.Ft(u,v?0:n.tabs.length>1?2:1):o.Bn.reload(s.getRunNextCmdBy(0)),o.On()}))})})},
Ut:function(n,r,u,a){if(e.e.Ge)return c.complainLimits("setIncogCS"),void a(0);var f=i.er(u.url)
;t.St.Lt(r,f)?a(0):o.Cn.contentSettings[r].get({primaryUrl:f,incognito:true},function(e){
return o.On()?(o.Cn.contentSettings[r].get({primaryUrl:f},function(e){e&&"allow"===e.setting?a(1):o.An.create({
type:"normal",incognito:true,focused:false,url:"about:blank"},function(e){var i=e.tabs[0].id
;return t.St.Jt(n,r,u,f,e.id,true,function(){o.Bn.remove(i)})})
}),o.On()):e&&"allow"===e.setting&&u.incognito?t.St.Qt(u):void o.An.getAll(function(o){var i,a,c
;if((o=o.filter(function(n){return n.incognito&&"normal"===n.type})).length)return i=v.preferLastWnd(o),
e&&"allow"===e.setting?t.St.Qt(u,i.id):(a=u.windowId,c=u.incognito&&o.some(function(n){return n.id===a}),
t.St.Jt(n,r,u,f,c?void 0:i.id))
;console.log("%cContentSettings_.ensure","color:red","get incognito content settings",e," but can not find an incognito window.")
})})},Jt:function(n,e,r,i,u,a,c){var f=t.St.Dt.bind(null,r,u,c);return t.St.qt(e,i,n,{scope:"incognito_session_only",
setting:"allow"},a&&u!==r.windowId?function(n){if(n)return f(n);o.An.get(r.windowId,f)}:f)},qt:function(n,e,i,u,a){
var c,f=false,l=o.Cn.contentSettings[n],s=function(){var n=o.On();return n&&console.log("[%o]",Date.now(),n),f||(--d,
((f=!!n)||0===d)&&setTimeout(a,0,f)),n},v=t.St.Ot(e,0|i),d=v.length;if(d<=0)return a(true);for(c of(r.mn(u),
v))l.set(Object.assign({primaryPattern:c},u),s)},Dt:function(n,e,r,i){true!==i&&t.St.Qt(n,e),r&&r(),
true!==i?e&&o.An.update(e,{focused:true,state:i?i.state:void 0}):s.runNextCmd(0)},Qt:function(n,t){n.active=true,
"number"==typeof t&&n.windowId!==t&&(n.index=void 0,n.windowId=t),d.Ft(n)}},t.It={ro:function(n,r,o){
var i,u,c,f=n.l,l=n.n,s=n.u,v=n.s
;f&&0===v[0]&&0===v[1]&&(2===v.length?(i=s.indexOf("#"))>0&&i<s.length-1&&v.push(s.slice(i)):(v[2]||"").length<2&&v.pop()),
u=t.It.Gt(l,f?s:""),c=JSON.stringify(f?v:{tabId:o,url:s,scroll:v}),r?(e.O||(_.Kt(),e.O=new Map)).set(u,c):a.io(u,c)},
xt:function(n,r){var o,i=r.s.Hn
;n.s?t.It.ro(n,r.s.Un,i):(r=(null===(o=e.z.get(i))||void 0===o?void 0:o.Sn)||r)&&r.postMessage({N:11,n:n.n})},
zt:function(n,i){var u,a,f,d,_,m,p,g,h=n.n,b=t.It.Gt(h,n.u),w=i.s.Un&&(null==e.O?void 0:e.O.get(b))||e.ie.get(b),y=n.c
;if(n.l&&((u=w?JSON.parse(w):null)||(f=void 0,d=void 0,(a=n.o)&&(f=+a.x)>=0&&(d=+a.y)>=0&&(u=[f,d,a.h])),
u))t.It.Ht(i,2,h,u,y);else{if(!w)return _=n.l?"Local":"Global",void Promise.resolve(l.Yn(_)).then(function(n){
c.showHUD(l.Yn("noMark",[n||_,h]))});p=+(m=JSON.parse(w)).tabId,(g={u:m.url,s:m.scroll,t:m.tabId,n:h,p:true,
q:v.parseOpenPageUrlOptions(y),f:s.parseFallbackOptions(y)}).p=false!==y.prefix&&0===g.s[1]&&0===g.s[0]&&!!r.en(g.u),
p>=0&&e.z.has(p)?o.tabsGet(p,t.It.Zt.bind(0,g)):e.K[20](g)}},Zt:function(n,r){var i=o.getTabUrl(r).split("#",1)[0]
;if(i===n.u||n.p&&n.u.startsWith(i))return e.K[5]({s:r.id}),t.It.Bt(n,r);e.K[20](n)},Gt:function(n,t){
return t?"vimiumMark|"+u.eu(t.split("#",1)[0])+(t.length>1?"|"+n:""):"vimiumGlobalMark|"+n},Ht:function(n,t,e,r,o){
n.postMessage({N:15,l:t,n:e,s:r,f:o})},Bt:function(n,r){var o,i=r.id,u=null===(o=e.z.get(i))||void 0===o?void 0:o.Sn
;if(u&&t.It.Ht(u,0,n.n,n.s,n.f),n.t!==i&&n.n)return t.It.ro(n,2===e.A,i)},Et:function(n){var r,o=t.It.Gt("",n),i=0
;e.ie.forEach(function(n,t){t.startsWith(o)&&(i++,a.io(t,null))}),(r=e.O)&&r.forEach(function(n,t){
t.startsWith(o)&&(i++,r.delete(t))
}),Promise.all(["#"===n?l.Yn("allLocal"):l.gr(n?"41":"39"),l.Yn(1!==i?"have":"has")]).then(function(n){
c.showHUD(l.Yn("markRemoved",[i,n[0],n[1]]))})}},t.Ct={Vt:null,Xt:0,Yt:function(){
var n=e.ie.get("findModeRawQueryList")||"";t.Ct.Vt=n?n.split("\n"):[],t.Ct.Yt=null},_r:function(n,o,i){var u,c,f=t.Ct
;if(f.Yt&&f.Yt(),u=n?e.q||(_.Kt(),e.q=f.Vt.slice(0)):f.Vt,!o)return u[u.length-(i||1)]||"";o=o.replace(/\n/g," "),
n?f.mr(o,u,true):(o=r.vn(o,0,99),(c=f.mr(o,u))&&a.io("findModeRawQueryList",c),e.q&&f.mr(o,e.q,true))},
mr:function(n,t,e){var r=t.lastIndexOf(n);if(r>=0){if(r===t.length-1)return;t.splice(r,1)}else t.length>=50&&t.shift()
;if(t.push(n),!e)return t.join("\n")},pr:function(n){n?e.q&&(e.q=[]):(t.Ct.Yt=null,t.Ct.Vt=[],
a.io("findModeRawQueryList",""))}},_={hr:false,Xt:0,Kt:function(){_.hr||(o.An.onRemoved.addListener(_.wr),_.hr=true)},
wr:function(){_.hr&&(_.Xt=_.Xt||setTimeout(_.yr,34))},yr:function(){var n;if(_.Xt=0,
e.de>51)for(n of e.z.values())if(n.Qn.s.Un)return;o.An.getAll(function(n){n.some(function(n){return n.incognito
})||_.Mr()})},Mr:function(){e.q=null,e.O=null,o.An.onRemoved.removeListener(_.wr),_.hr=false}},t.Mt={Cr:[1,1],kr:0,
Ir:function(n){var e=t.Mt.Cr[n];return"object"==typeof e?e.matches:null},Sr:function(n,e){
var r,o=2===e,i=t.Mt,u=i.Cr,a=u[n],c=n?"prefers-color-scheme":"prefers-reduced-motion"
;1===a&&o&&(u[n]=a=matchMedia("(".concat(c,")")).matches?2:0),
o&&2===a?((r=matchMedia("(".concat(c,": ").concat(n?"dark":"reduce",")"))).onchange=i.Tr,u[n]=r,
i.kr=i.kr||setInterval(t.Mt.Lr,6e4)):o||"object"!=typeof a||(a.onchange=null,u[n]=2,i.kr>0&&u.every(function(n){
return"object"!=typeof n})&&(clearInterval(i.kr),i.kr=0))},Or:function(n,r,o){var i,u,c,l,s=t.Mt.Cr[n]
;i=n?"dark":"less-motion",
l=a.ao(c=n?"d":"m",u="object"==typeof s?s.matches:null!=o?o:1===(0===n?e.ce.autoReduceMotion:e.ce.autoDarkMode)),
e.ue[c]!==l&&(e.ue[c]=l,r||a.so({N:6,d:[c]})),f.ii({t:i,
e:u||" ".concat(e.ce.vomnibarOptions.styles," ").includes(" ".concat(i," ")),b:!r})},Lr:function(){var n,e
;for(e=(n=t.Mt.Cr).length;0<=--e;)"object"==typeof n[e]&&t.Mt.Or(e)},Tr:function(){t.Mt.kr>0&&clearInterval(t.Mt.kr),
t.Mt.kr=-1;var n=t.Mt.Cr.indexOf(this);n>=0&&t.Mt.Or(n)}},t._t={Nr:null,Rr:e.C},setTimeout(function(){function n(n){
var t,i,u;n.windowId===e.J?((t=performance.now())-l>666&&(i=c.get(e.L),u=1===e.fe?Date.now():t,i?(i.i=++f,
i.t=u):c.set(e.L,{i:++f,t:u}),f>2037&&o.Bn.query({},s)),e.L=n.tabId,l=t):o.An.get(n.windowId,r)}function r(n){
if(n.focused){var t=n.id;t!==e.J&&(e.E=e.J,e.J=t),o.Bn.query({windowId:t,active:true},function(n){
n&&n.length>0&&t===e.J&&i(n)})}}function i(r){if(!r||0===r.length)return o.On();var i=r[0],u=i.windowId,a=e.J
;u!==a&&(e.J=u,e.E=a),e.A=i.incognito?2:1,t._t.Rr(),n({tabId:i.id,windowId:u})}var u=e.J,c=e.T,f=1,l=0,s=function(n){
var t=n?n.map(function(n){return[n.id,c.get(n.id)]}).filter(function(n){return n[1]}).sort(function(n,t){
return n[1].i-t[1].i}):[];t.length>1023&&t.splice(0,t.length-1023),t.forEach(function(n,t){return n[1].i=t+2}),
(f=t.length>0?t[t.length-1][1].i:1)>1?e.T=c=new Map(t):(c.forEach(function(n,t){n.i<1026?c.delete(t):n.i-=1024}),f=1024)
};o.Bn.onActivated.addListener(n),o.An.onFocusChanged.addListener(function(n){n!==u&&o.Bn.query({windowId:n,active:true
},i)}),o.getCurTab(function(n){l=performance.now();var t=n&&n[0];if(!t)return o.On();e.L=t.id,e.J=t.windowId,
e.A=t.incognito?2:1}),t._t.Nr=function(n,t){return c.get(t.id).i-c.get(n.id).i},a.lo.then(function(){
for(var n of["images","plugins","javascript","cookies"])null!=e.ie.get(t.St.jt(n))&&o.Cn.contentSettings&&setTimeout(t.St.Rt,100,n)
})},120),e.F.autoDarkMode=e.F.autoReduceMotion=function(n,e){var r=e.length>12?0:1
;t.Mt.Sr(r,n="boolean"==typeof n?n?2:0:n),t.Mt.Or(r,0,2===n?null:n>0)},e.F.vomnibarOptions=function(n){
var r,o,i,u,c,f,l=a.to.vomnibarOptions,s=e.ae,v=true,d=l.actions,_=l.maxMatches,m=l.queryInterval,p=l.styles,g=l.sizes
;n!==l&&n&&"object"==typeof n&&(r=Math.max(3,Math.min(0|n.maxMatches||_,25)),o=((n.actions||"")+"").trim(),
i=+n.queryInterval,u=((n.sizes||"")+"").trim(),c=((n.styles||"")+"").trim(),f=Math.max(0,Math.min(i>=0?i:m,1200)),
(v=_===r&&m===f&&u===g&&d===o&&p===c)||(_=r,m=f,g=u,p=c),n.actions=o,n.maxMatches=r,n.queryInterval=f,n.sizes=u,
n.styles=c),e.ce.vomnibarOptions=v?l:n,s.n=_,s.t=m,s.l=g,s.s=p,t.Mt.Or(0,1),t.Mt.Or(1,1),a.no({N:47,d:{n:_,t:m,l:g,s:s.s
}})}});