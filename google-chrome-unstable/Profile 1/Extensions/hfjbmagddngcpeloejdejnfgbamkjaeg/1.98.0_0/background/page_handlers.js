"use strict"
;__filename="background/page_handlers.js",define(["require","exports","./store","./utils","./browser","./normalize_urls","./parse_urls","./settings","./ports","./exclusions","./ui_css","./key_mappings","./run_commands","./tools","./open_urls","./frame_commands"],function(n,u,r,t,l,e,o,i,f,c,s,a,v,d,m,p){
var _,g,b,k;Object.defineProperty(u,"__esModule",{value:true}),u.onReq=void 0,i=i,c=c,_=[function(){
return[i.to,r.fe,r.e.Je]},function(n){var u,t,l,e=r.h;if(e)return e.then(_[1].bind(null,n,null));for(t in u={},
i.to)(l=r.ce[t])!==i.to[t]&&(u[t]=l);return u},function(n){var u,t,l=n.key,e=n.val
;return e=null!==(u=null!=e?e:i.to[l])&&void 0!==u?u:null,i.ro(l,e),(t=r.ce[l])!==e?t:null},function(n){
var u=i.ao(n.key,n.val);return u!==n.val?u:null},function(n){i.so({N:6,d:n})},function(n){return r.ce[n.key]
},function(n){r.z.has(n)||l.n(n)},function(){var n,u=a.pt;return!(!r.ue.l||u||(n=Object.keys(r.y).join(""),
n+=r.x?Object.keys(r.x).join(""):"",!/[^ -\xff]/.test(n)))||(u?(function(n){
var u,r,t=n.length>1?n.length+" Errors:\n":"Error: ";for(r of n)u=0,t+=r[0].replace(/%([a-z])/g,function(n,t){return++u,
"c"===t?"":"s"===t||"d"===t?r[u]:JSON.stringify(r[u])}),u+1<r.length&&(t+=" "+r.slice(u+1).map(function(n){
return"object"==typeof n&&n?JSON.stringify(n):n}).join(" ")),t+=".\n";return t})(u):"")},function(n){
var u=f.indexFrame(n[1],0);return u&&u.s&&(u.s.Ln|=44),s.mergeCSS(n[0],-1)},function(n){n&&i.io("isHC_f",n.hc?"1":null),
s.ri(2)},function(n){return[e.rr(n[0],null,n[1]),e.nr]},function(){d.Mt.Lr()},function(){var n=r.R.get("?"),u="?"
;return n&&7===n.wt&&n.ht||r.R.forEach(function(n,r){7===n.wt&&n.ht&&(u=u&&u.length<r.length?u:r)}),u},function(n){var u
;return[n=e.rr(n,null,0),null!==(u=r.Y.get(n))&&void 0!==u?u:null]},function(n){var u,r,t,l=new Map
;return o.uu("k:"+n,l),
null==(u=l.get("k"))?null:(r=e.rr(u.fr,null,-2),[!(t=e.nr>2),t?u.fr:r.replace(/\s+/g,"%20")+(u.ou&&"k"!==u.ou?" "+u.ou:"")])
},function(n){m.du(n)},function(n){var u=null;return n.startsWith("vimium://")&&(u=r.u(n.slice(9),1,true)),
"string"==typeof(u=null!==u?u:e.rr(n,null,-1))&&(u=o.tu(u,"whole"),u=e.Ye(u)),u},function(){return r.r&&r.r()
},function(n){return r.i(n[0],n[1])},function(n){return m.pu(n)},function(){
return Promise.all([l.Wn(l.getCurTab),r.h]).then(function(n){
var u,e=n[0],o=e&&e[0]||null,f=o?o.id:r.L,s=null!==(u=r.z.get(f))&&void 0!==u?u:null,a=o?l.getTabUrl(o):s&&(s.Sn||s.Qn).s.fr||"",v=!s||s.Qn.s.Dn&&!t.kn.test(s.Qn.s.fr)?null:s.Qn.s,d=!(s||o&&a&&"loading"===o.status&&/^(ht|s?f)tp/.test(a)),m=k(s),p=!d&&!m,_=p?null:m||!a?m:a.startsWith(location.protocol)&&!a.startsWith(location.origin+"/")?new URL(a).host:null,g=_?r.X.get(_):null
;return p||null==g||true===g?_=null:s&&(s.Xn=-1),{ver:r.e.qe,runnable:p,url:a,tabId:f,
frameId:s&&(v||s.Sn)?(v||s.Sn.s).Dn:0,topUrl:v&&v.Dn&&s.Sn?s.Sn.s.fr:null,frameUrl:v&&v.fr,lock:s&&s.En?s.En.ve:null,
status:v?v.ve:0,unknownExt:_,exclusions:p?{rules:r.ce.exclusionRules,onlyFirst:r.ce.exclusionOnlyFirstMatch,
matchers:c.tt(null),defaults:i.to.exclusionRules}:null,os:r.fe,reduceMotion:r.ue.m}})},function(n){
var u,e,o=n[0],f=n[1],c=r.ce.extAllowList,s=c.split("\n")
;return s.indexOf(f)<0&&(u=s.indexOf("# "+f)+1||s.indexOf("#"+f)+1,s.splice(u?u-1:s.length,u?1:0,f),c=s.join("\n"),
i.ro("extAllowList",c)),(e=r.z.get(o))&&(e.Xn=null),l.Wn(l.Cn.tabs.get,o).then(function(n){var u=t.g(),r=function(){
return v.runNextOnTabLoaded({},n,u.zn),l.Cn.runtime.lastError};return n?l.Cn.tabs.reload(n.id,r):l.Cn.tabs.reload(r),
u.xn})},function(n){var u,t,l=n[1],e=n[2]
;return r.u("status/"+n[0],3),t=(u=f.indexFrame(l,e)||f.indexFrame(l,0))?r.z.get(l).En:null,u&&!t&&r.K[8]({u:u.s.fr},u),
[u?u.s.ve:0,t?t.ve:null]},function(n){return c.tt(n)[0]},function(n,u){return p.initHelp({f:true},u)},function(n){
var u,r,t,e=n.module,o=n.name,i=g[e];return g.hasOwnProperty(e)&&i.includes(o)?(r=n.args,t=(u=l.Cn[e])[o],
new Promise(function(n){r.push(function(u){var r=l.On();return n(r?[void 0,r]:[b(u),void 0]),r}),t.apply(u,r)
})):[void 0,{message:"refused"}]},function(n,u){return u.s.Hn},function(n){var u,l=t.pn();return n?(u=r.ie.get(n),
l[n]=null!=u?u:null):r.ie.forEach(function(n,u){l[u]=n}),l},function(n){var u=n.key,r=n.val;u.includes("|")&&i.io(u,r)
}],g={permissions:["contains","request","remove"],tabs:["update"]},b=function(n){return{
message:n&&n.message?n.message+"":JSON.stringify(n)}},u.onReq=function(n,u){return _[n.n](n.q,u)},k=function(n){
return n&&"string"==typeof n.Xn&&true!==r.X.get(n.Xn)?n.Xn:null}});